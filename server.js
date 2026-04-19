const express    = require('express');
const nodemailer = require('nodemailer');
const mysql      = require('mysql2/promise');
const cors       = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Database ──────────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host             : process.env.MYSQL_HOST     || 'sql12.freesqldatabase.com',
  user             : process.env.MYSQL_USER     || 'sql12823587',
  password         : process.env.MYSQL_PASSWORD || 'SyGJtHp65h',
  database         : process.env.MYSQL_DATABASE || 'sql12823587',
  port             : process.env.MYSQL_PORT     || 3306,
  waitForConnections: true,
  connectionLimit  : 5,
  connectTimeout   : 30000,
  acquireTimeout   : 30000,
  // ── Keep-alive for Render free tier ──
  enableKeepAlive  : true,
  keepAliveInitialDelay: 10000
});

async function query(sql, params) {
  params = params || [];
  try {
    const result = await pool.execute(sql, params);
    return result[0];
  } catch (err) {
    // Reconnect on lost connection
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log('🔄 DB connection lost, retrying...');
      const result = await pool.execute(sql, params);
      return result[0];
    }
    throw err;
  }
}

// ── Keep-alive ping every 4 minutes (Render free tier sleeps after 5 min) ────
setInterval(async () => {
  try {
    await pool.execute('SELECT 1');
    console.log('💓 DB keep-alive ping OK');
  } catch (e) {
    console.log('⚠️ Keep-alive ping failed:', e.message);
  }
}, 4 * 60 * 1000);

app.use(express.static('web'));

// ── Email Configuration ───────────────────────────────────────────────────────
const EMAIL_USER = process.env.EMAIL_USER || 'shivanigupta18082005@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'jrbb vtvh twxy hrje';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// ── Send leave email ──────────────────────────────────────────────────────────
async function sendLeaveEmail(toEmail, teacherName, leaveType, startDate, endDate, duration, action) {
  const isApproved = action === 'Approved';
  const emoji      = isApproved ? '✅' : '❌';
  const color      = isApproved ? '#16a34a' : '#dc2626';
  const bgColor    = isApproved ? '#f0fdf4' : '#fef2f2';
  const subject    = `${emoji} Leave ${action} — ${leaveType} | University Management System`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
                border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:${color};padding:28px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">${emoji}</div>
        <h2 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Leave Request ${action}</h2>
      </div>
      <div style="padding:28px;background:#fff;">
        <p style="font-size:16px;color:#374151;margin:0 0 20px;">Dear <strong>${teacherName}</strong>,</p>
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">
          Your leave request has been <strong style="color:${color};">${action}</strong> by the administration.
        </p>
        <div style="background:${bgColor};border-radius:8px;padding:16px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">Leave Type</td><td style="padding:8px 12px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${leaveType}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">From</td><td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${startDate}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">To</td><td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${endDate}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">Duration</td><td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${duration} day(s)</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Status</td><td style="padding:8px 12px;"><span style="background:${color};color:#fff;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;">${action}</span></td></tr>
          </table>
        </div>
        ${isApproved
          ? `<p style="font-size:14px;color:#374151;background:#f0fdf4;border-left:4px solid #16a34a;padding:12px;border-radius:4px;">Please ensure all your responsibilities are properly handed over before your leave begins.</p>`
          : `<p style="font-size:14px;color:#374151;background:#fef2f2;border-left:4px solid #dc2626;padding:12px;border-radius:4px;">If you have any questions regarding this decision, please contact the administration office.</p>`}
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated email from <strong>University Management System</strong></p>
        <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">© ${new Date().getFullYear()} UMS — Do not reply to this email</p>
      </div>
    </div>`;

  await transporter.sendMail({ from: `"UMS System" <${EMAIL_USER}>`, to: toEmail, subject, html });
  console.log(`📧 Email sent to ${toEmail} — Leave ${action}`);
}

// ── AUTO-INIT DB — creates ALL missing tables and columns ─────────────────────
async function initDB() {
  try {
    // 1. teacher_attendance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teacher_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empId VARCHAR(50) NOT NULL,
        teacherName VARCHAR(100) DEFAULT NULL,
        year INT NOT NULL,
        totalDays INT NOT NULL DEFAULT 0,
        sundays INT NOT NULL DEFAULT 0,
        workingDays INT NOT NULL DEFAULT 0,
        leavesTaken DECIMAL(6,1) NOT NULL DEFAULT 0,
        daysPresent DECIMAL(6,1) NOT NULL DEFAULT 0,
        attendancePct DECIMAL(5,2) NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_teacher_year (empId, year)
      )`);
    console.log('✅ teacher_attendance ready.');

    // 2. teacher_leave_quota
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teacher_leave_quota (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empId VARCHAR(50) NOT NULL,
        leaveTypeName VARCHAR(100) NOT NULL,
        allocatedDays DECIMAL(6,1) NOT NULL DEFAULT 0,
        year INT NOT NULL,
        notes VARCHAR(255) DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_quota (empId, leaveTypeName, year)
      )`);
    console.log('✅ teacher_leave_quota ready.');

    // 3. ★ holiday table — NEW
    await pool.query(`
      CREATE TABLE IF NOT EXISTS holiday (
        id INT AUTO_INCREMENT PRIMARY KEY,
        holidayName VARCHAR(100) NOT NULL,
        holidayDate DATE NOT NULL,
        holidayType VARCHAR(50) DEFAULT 'National',
        UNIQUE KEY uq_holiday_date (holidayDate)
      )`);
    console.log('✅ holiday ready.');

    // 4. ★ dailyattendance table — NEW
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dailyattendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empId VARCHAR(50) NOT NULL,
        attendanceDate DATE NOT NULL,
        status VARCHAR(10) DEFAULT 'Present',
        UNIQUE KEY uq_daily (empId, attendanceDate)
      )`);
    console.log('✅ dailyattendance ready.');

    // 5. attendance summary table — NEW
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empId VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        totalDays INT DEFAULT 0,
        sundays INT DEFAULT 0,
        holidays INT DEFAULT 0,
        workingDays INT DEFAULT 0,
        leavesTaken INT DEFAULT 0,
        daysPresent INT DEFAULT 0,
        attendancePct DECIMAL(5,2) DEFAULT 0,
        UNIQUE KEY uq_att_year (empId, year)
      )`);
    console.log('✅ attendance summary ready.');

    // 6. teacherleave id column
    const [tlCols] = await pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='teacherleave'`);
    const tlNames  = tlCols.map(c => c.COLUMN_NAME.toLowerCase());
    if (!tlNames.includes('id')) {
      await pool.query(`ALTER TABLE teacherleave ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST`);
      console.log('✅ Added id to teacherleave.');
    }

    // 7. teacher extra columns
    const [tCols] = await pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='teacher'`);
    const tNames  = tCols.map(c => c.COLUMN_NAME.toLowerCase());
    if (!tNames.includes('stafftype'))     { await pool.query(`ALTER TABLE teacher ADD COLUMN staffType VARCHAR(30) DEFAULT 'Teaching Staff'`); }
    if (!tNames.includes('gender'))        { await pool.query(`ALTER TABLE teacher ADD COLUMN gender VARCHAR(20) DEFAULT NULL`); }
    if (!tNames.includes('maritalstatus')) { await pool.query(`ALTER TABLE teacher ADD COLUMN maritalStatus VARCHAR(20) DEFAULT NULL`); }

    // 8. leavetype extra columns
    const [ltCols] = await pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='leavetype'`);
    const ltNames  = ltCols.map(c => c.COLUMN_NAME.toLowerCase());
    if (!ltNames.includes('applicableto'))     { await pool.query(`ALTER TABLE leavetype ADD COLUMN applicableTo VARCHAR(30) DEFAULT 'All'`); await pool.query(`UPDATE leavetype SET applicableTo='All' WHERE applicableTo IS NULL OR applicableTo=''`); }
    if (!ltNames.includes('genderapplicable')) { await pool.query(`ALTER TABLE leavetype ADD COLUMN genderApplicable VARCHAR(20) DEFAULT 'Any'`); await pool.query(`UPDATE leavetype SET genderApplicable='Any' WHERE genderApplicable IS NULL OR genderApplicable=''`); }
    if (!ltNames.includes('maritalapplicable')){ await pool.query(`ALTER TABLE leavetype ADD COLUMN maritalApplicable VARCHAR(20) DEFAULT 'Any'`); await pool.query(`UPDATE leavetype SET maritalApplicable='Any' WHERE maritalApplicable IS NULL OR maritalApplicable=''`); }

    console.log('✅ All DB tables ready.');
  } catch (err) { console.error('❌ DB init error:', err.message); }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysInYear(y) { return ((y%4===0&&y%100!==0)||y%400===0)?366:365; }
function countSundaysInYear(y) { let c=0; const d=new Date(y,0,1); while(d.getFullYear()===y){if(d.getDay()===0)c++;d.setDate(d.getDate()+1);} return c; }
async function getLeaveLimits() {
  try { const rows=await query('SELECT leaveTypeName,maxDays FROM leavetype'); if(!rows.length)throw new Error('empty'); const l={}; rows.forEach(r=>{l[r.leaveTypeName]=r.maxDays;}); return l; }
  catch(e) { return {Medical:10,Casual:12,Duty:10,Compoff:5}; }
}

// ── Health check (keeps Render from sleeping) ─────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/', (req, res) => res.redirect('/dashboard.html'));

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/login', async(req,res)=>{
  const {username,password}=req.body;
  if(!username||!password) return res.status(400).json({success:false,message:'Missing credentials'});
  try { const rows=await query('SELECT * FROM login WHERE username=? AND password=?',[username,password]); if(rows.length>0)res.json({success:true}); else res.status(401).json({success:false,message:'Invalid username or password'}); }
  catch(err){res.status(500).json({success:false,message:'DB error: '+err.message});}
});

// ── STUDENTS ──────────────────────────────────────────────────────────────────
app.get('/api/students', async(req,res)=>{ try{res.json(await query('SELECT * FROM student'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/students', async(req,res)=>{
  const b=req.body; if(!b.name||!b.rollno) return res.status(400).json({error:'Name and Roll Number are required.'});
  try{ await query('INSERT INTO student (name,fname,rollno,dob,address,phone,email,class_x,class_xii,aadhar,course,branch) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[b.name,b.fname||null,b.rollno,b.dob||null,b.address||null,b.phone||null,b.email||null,b.class_x||null,b.class_xii||null,b.aadhar||null,b.course||null,b.branch||null]); res.json({success:true,message:'Student added successfully'}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.put('/api/students/:rollno', async(req,res)=>{
  const orig=req.params.rollno; const b=req.body;
  try{ await query('UPDATE student SET name=?,fname=?,rollno=?,dob=?,address=?,phone=?,email=?,class_x=?,class_xii=?,aadhar=?,course=?,branch=? WHERE rollno=?',[b.name,b.fname||null,b.rollno,b.dob||null,b.address||null,b.phone||null,b.email||null,b.class_x||null,b.class_xii||null,b.aadhar||null,b.course||null,b.branch||null,orig]); res.json({success:true}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.delete('/api/students/:rollno', async(req,res)=>{ try{await query('DELETE FROM student WHERE rollno=?',[req.params.rollno]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── TEACHERS ──────────────────────────────────────────────────────────────────
app.get('/api/teachers', async(req,res)=>{ try{res.json(await query('SELECT * FROM teacher'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/teachers', async(req,res)=>{
  const b=req.body; if(!b.name||!b.empId||!b.department) return res.status(400).json({error:'Name, Employee ID and Department are required.'});
  try{ await query('INSERT INTO teacher (name,fname,empId,dob,address,phone,email,class_x,class_xii,aadhar,education,department,staffType,gender,maritalStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[b.name,b.fname||null,b.empId,b.dob||null,b.address||null,b.phone||null,b.email||null,b.class_x||null,b.class_xii||null,b.aadhar||null,b.education||null,b.department,b.staffType||'Teaching Staff',b.gender||null,b.maritalStatus||null]); res.json({success:true,message:'Teacher added successfully'}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.put('/api/teachers/:empId', async(req,res)=>{
  const orig=req.params.empId; const b=req.body;
  try{ await query('UPDATE teacher SET name=?,fname=?,empId=?,dob=?,address=?,phone=?,email=?,class_x=?,class_xii=?,aadhar=?,education=?,department=?,staffType=?,gender=?,maritalStatus=? WHERE empId=?',[b.name,b.fname||null,b.empId,b.dob||null,b.address||null,b.phone||null,b.email||null,b.class_x||null,b.class_xii||null,b.aadhar||null,b.education||null,b.department,b.staffType||'Teaching Staff',b.gender||null,b.maritalStatus||null,orig]); res.json({success:true}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.delete('/api/teachers/:empId', async(req,res)=>{ try{await query('DELETE FROM teacher WHERE empId=?',[req.params.empId]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── LEAVE TYPES ───────────────────────────────────────────────────────────────
app.get('/api/leave-types', async(req,res)=>{ try{res.json(await query('SELECT * FROM leavetype ORDER BY leaveTypeName'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/leave-types', async(req,res)=>{
  const {leaveTypeName,maxDays,description,applicableTo,genderApplicable,maritalApplicable}=req.body;
  if(!leaveTypeName||!maxDays) return res.status(400).json({error:'Leave Type Name and Max Days are required.'});
  try{ const ex=await query('SELECT id FROM leavetype WHERE leaveTypeName=?',[leaveTypeName]); if(ex.length) return res.status(409).json({error:`"${leaveTypeName}" already exists.`}); await query('INSERT INTO leavetype (leaveTypeName,maxDays,description,applicableTo,genderApplicable,maritalApplicable) VALUES (?,?,?,?,?,?)',[leaveTypeName,Number(maxDays),description||null,applicableTo||'All',genderApplicable||'Any',maritalApplicable||'Any']); res.json({success:true,message:'Leave type added.'}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.put('/api/leave-types/:id', async(req,res)=>{
  const {leaveTypeName,maxDays,description,applicableTo,genderApplicable,maritalApplicable}=req.body;
  if(!leaveTypeName||!maxDays) return res.status(400).json({error:'Leave Type Name and Max Days are required.'});
  try{ const ex=await query('SELECT id FROM leavetype WHERE leaveTypeName=? AND id!=?',[leaveTypeName,req.params.id]); if(ex.length) return res.status(409).json({error:`"${leaveTypeName}" already exists.`}); await query('UPDATE leavetype SET leaveTypeName=?,maxDays=?,description=?,applicableTo=?,genderApplicable=?,maritalApplicable=? WHERE id=?',[leaveTypeName,Number(maxDays),description||null,applicableTo||'All',genderApplicable||'Any',maritalApplicable||'Any',req.params.id]); res.json({success:true,message:'Leave type updated.'}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.delete('/api/leave-types/:id', async(req,res)=>{ try{await query('DELETE FROM leavetype WHERE id=?',[req.params.id]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── TEACHER LEAVE TYPES ───────────────────────────────────────────────────────
app.get('/api/teacher-leave-types', async(req,res)=>{
  const {empId,year}=req.query; if(!empId) return res.status(400).json({error:'empId is required'});
  const targetYear=parseInt(year)||new Date().getFullYear();
  try{
    const teachers=await query('SELECT empId,name,department,staffType,gender,maritalStatus FROM teacher WHERE empId=?',[empId]);
    if(!teachers.length) return res.status(404).json({error:'Teacher not found.'});
    const t=teachers[0]; const staffType=t.staffType||'Teaching Staff'; const gender=t.gender||'Any'; const marital=t.maritalStatus||'Any';
    const globalLeaves=await query(`SELECT id,leaveTypeName,maxDays,description,applicableTo,genderApplicable,maritalApplicable FROM leavetype WHERE (applicableTo='All' OR applicableTo=?) AND (genderApplicable='Any' OR genderApplicable=?) AND (maritalApplicable='Any' OR maritalApplicable=?) ORDER BY leaveTypeName`,[staffType,gender,marital]);
    const customQuotas=await query('SELECT leaveTypeName,allocatedDays,notes FROM teacher_leave_quota WHERE empId=? AND year=?',[empId,targetYear]);
    const globalNames=globalLeaves.map(g=>g.leaveTypeName); const quotaMap={}; customQuotas.forEach(q=>{quotaMap[q.leaveTypeName]=q;});
    const result=[];
    globalLeaves.forEach(g=>{ const quota=quotaMap[g.leaveTypeName]; result.push({leaveTypeName:g.leaveTypeName,maxDays:quota?parseFloat(quota.allocatedDays):g.maxDays,description:g.description,isCustom:false,isOverridden:!!quota,notes:quota?quota.notes:null}); });
    customQuotas.filter(q=>!globalNames.includes(q.leaveTypeName)).forEach(q=>{ result.push({leaveTypeName:q.leaveTypeName,maxDays:parseFloat(q.allocatedDays),description:q.notes||null,isCustom:true,isOverridden:false,notes:q.notes}); });
    res.json({empId,teacherName:t.name,department:t.department,staffType,gender,maritalStatus:marital,year:targetYear,leaveTypes:result});
  }catch(err){res.status(500).json({error:err.message});}
});

// ── TEACHER LEAVE BALANCE ─────────────────────────────────────────────────────
app.get('/api/teacher-leave-balance', async(req,res)=>{
  const empId=req.query.empId; if(!empId) return res.status(400).json({error:'empId is required'});
  try{
    const teacher=await query('SELECT empId,staffType,gender,maritalStatus FROM teacher WHERE empId=?',[empId]);
    if(!teacher.length) return res.status(404).json({error:'Teacher not found.'});
    const t=teacher[0]; const staffType=t.staffType||'Teaching Staff'; const gender=t.gender||'Any'; const marital=t.maritalStatus||'Any';
    const currentYear=new Date().getFullYear().toString();
    const globalLeaves=await query(`SELECT leaveTypeName,maxDays FROM leavetype WHERE (applicableTo='All' OR applicableTo=?) AND (genderApplicable='Any' OR genderApplicable=?) AND (maritalApplicable='Any' OR maritalApplicable=?)`,[staffType,gender,marital]);
    const quotaLeaves=await query('SELECT leaveTypeName,allocatedDays FROM teacher_leave_quota WHERE empId=? AND year=?',[empId,currentYear]);
    const LEAVE_LIMITS={}; globalLeaves.forEach(g=>{LEAVE_LIMITS[g.leaveTypeName]=g.maxDays;}); quotaLeaves.forEach(q=>{LEAVE_LIMITS[q.leaveTypeName]=parseFloat(q.allocatedDays);});
    const leaves=await query(`SELECT leaveType,duration FROM teacherleave WHERE empId=? AND LEFT(date,4)=? AND status!='Rejected'`,[empId,currentYear]);
    const used={}; for(const l of leaves){const type=l.leaveType||'Casual';used[type]=(used[type]||0)+(parseFloat(l.duration)||0);}
    const balance={}; for(const [type,limit] of Object.entries(LEAVE_LIMITS)){const u=used[type]||0;balance[type]={total:limit,used:u,remaining:Math.max(0,limit-u)};}
    res.json({empId,staffType,year:parseInt(currentYear),balance});
  }catch(err){res.status(500).json({error:err.message});}
});

// ── TEACHER LEAVES ────────────────────────────────────────────────────────────
app.get('/api/teacher-leaves', async(req,res)=>{ try{const empId=req.query.empId; res.json(empId?await query('SELECT * FROM teacherleave WHERE empId=?',[empId]):await query('SELECT * FROM teacherleave'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/teacher-leaves', async(req,res)=>{
  const b=req.body; const empId=b.empId; const startDate=b.startDate||b.date; const endDate=b.endDate||b.date; const leaveType=b.leaveType||'Casual';
  if(!empId) return res.status(400).json({error:'Teacher ID is required.'});
  if(!startDate||!endDate) return res.status(400).json({error:'Please select both dates.'});
  const dateRegex=/^\d{4}-\d{2}-\d{2}$/; if(!dateRegex.test(startDate)||!dateRegex.test(endDate)) return res.status(400).json({error:'Invalid date format.'});
  const start=new Date(startDate),end=new Date(endDate); if(end<start) return res.status(400).json({error:'End date cannot be before start date.'});
  const duration=Math.ceil((end-start)/(1000*60*60*24))+1;
  try{
    const teacherRow=await query('SELECT empId,staffType,gender,maritalStatus FROM teacher WHERE empId=?',[empId]);
    if(!teacherRow.length) return res.status(404).json({error:'Teacher not found.'});
    const t=teacherRow[0]; const staffType=t.staffType||'Teaching Staff'; const gender=t.gender||'Any'; const marital=t.maritalStatus||'Any';
    const currentYear=new Date().getFullYear().toString();
    const quotaRow=await query('SELECT allocatedDays FROM teacher_leave_quota WHERE empId=? AND leaveTypeName=? AND year=?',[empId,leaveType,currentYear]);
    let maxDays=999;
    if(quotaRow.length){maxDays=parseFloat(quotaRow[0].allocatedDays);}
    else{const globalRow=await query(`SELECT maxDays FROM leavetype WHERE leaveTypeName=? AND (applicableTo='All' OR applicableTo=?) AND (genderApplicable='Any' OR genderApplicable=?) AND (maritalApplicable='Any' OR maritalApplicable=?)`,[leaveType,staffType,gender,marital]); if(globalRow.length)maxDays=globalRow[0].maxDays;}
    const usedRows=await query(`SELECT duration FROM teacherleave WHERE empId=? AND leaveType=? AND LEFT(date,4)=? AND status!='Rejected'`,[empId,leaveType,currentYear]);
    const alreadyUsed=usedRows.reduce((sum,r)=>sum+(parseFloat(r.duration)||0),0);
    const remaining=maxDays-alreadyUsed;
    if(duration>remaining) return res.status(400).json({error:`${leaveType} leave limit exceeded. You have ${remaining} day(s) remaining out of ${maxDays}.`});
    await query('INSERT INTO teacherleave (empId,date,duration,leaveType,startDate,endDate,status) VALUES (?,?,?,?,?,?,?)',[empId,startDate,String(duration),leaveType,startDate,endDate,'Pending']);
    res.json({success:true,message:'Leave request submitted successfully.',duration,leaveType,startDate,endDate});
  }catch(err){res.status(500).json({error:err.message});}
});
app.put('/api/teacher-leaves/:id', async(req,res)=>{
  const id=req.params.id; const {startDate,endDate,leaveType,status,duration}=req.body;
  if(!startDate||!endDate||!leaveType) return res.status(400).json({error:'Start Date, End Date and Leave Type are required.'});
  try{ const result=await query('UPDATE teacherleave SET startDate=?,endDate=?,date=?,leaveType=?,status=?,duration=? WHERE id=?',[startDate,endDate,startDate,leaveType,status||'Pending',duration,id]); if(result.affectedRows===0) return res.status(404).json({error:'Leave record not found.'}); res.json({success:true,message:'Leave updated.'}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.patch('/api/teacher-leaves/:id', async(req,res)=>{
  const {action}=req.body;
  if(!['Approved','Rejected'].includes(action)) return res.status(400).json({error:'Action must be Approved or Rejected.'});
  try{
    await query('UPDATE teacherleave SET status=? WHERE id=?',[action,req.params.id]);
    const rows=await query(`SELECT tl.*,t.name AS teacherName,t.email AS teacherEmail FROM teacherleave tl LEFT JOIN teacher t ON t.empId=tl.empId WHERE tl.id=?`,[req.params.id]);
    let emailStatus='';
    if(rows.length && rows[0].teacherEmail){
      const l=rows[0];
      try{ await sendLeaveEmail(l.teacherEmail,l.teacherName||l.empId,l.leaveType||'Leave',l.startDate||l.date,l.endDate||l.date,l.duration||'1',action); emailStatus=' Email sent to '+l.teacherEmail; }
      catch(emailErr){ console.error('❌ Email failed:',emailErr.message); emailStatus=' (Email failed: '+emailErr.message+')'; }
    } else { emailStatus=' (No email saved for teacher)'; }
    res.json({success:true,message:`Leave ${action} successfully.${emailStatus}`});
  }catch(err){res.status(500).json({error:err.message});}
});
app.delete('/api/teacher-leaves/:id', async(req,res)=>{ try{await query('DELETE FROM teacherleave WHERE id=?',[req.params.id]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── STUDENT LEAVE BALANCE ─────────────────────────────────────────────────────
app.get('/api/student-leave-balance', async(req,res)=>{
  const rollno=req.query.rollno; if(!rollno) return res.status(400).json({error:'rollno is required'});
  try{ const student=await query('SELECT rollno FROM student WHERE rollno=?',[rollno]); if(!student.length) return res.status(404).json({error:'Student not found.'}); const LEAVE_LIMITS=await getLeaveLimits(); const currentYear=new Date().getFullYear().toString(); const leaves=await query(`SELECT leaveType,duration FROM studentleave WHERE rollno=? AND LEFT(date,4)=? AND status!='Rejected'`,[rollno,currentYear]); const used={}; for(const l of leaves){const type=l.leaveType||'Casual';used[type]=(used[type]||0)+(parseFloat(l.duration)||0);} const balance={}; for(const [type,limit] of Object.entries(LEAVE_LIMITS)){const u=used[type]||0;balance[type]={total:limit,used:u,remaining:Math.max(0,limit-u)};} res.json({rollno,year:parseInt(currentYear),balance}); }
  catch(err){res.status(500).json({error:err.message});}
});

// ── STUDENT LEAVES ────────────────────────────────────────────────────────────
app.get('/api/student-leaves', async(req,res)=>{ try{const rollno=req.query.rollno; res.json(rollno?await query('SELECT * FROM studentleave WHERE rollno=?',[rollno]):await query('SELECT * FROM studentleave'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/student-leaves', async(req,res)=>{
  const b=req.body; const rollno=b.rollno; const startDate=b.startDate||b.date; const endDate=b.endDate||b.date; const leaveType=b.leaveType||'Casual';
  if(!rollno) return res.status(400).json({error:'Roll number is required.'});
  if(!startDate||!endDate) return res.status(400).json({error:'Please select both dates.'});
  const dateRegex=/^\d{4}-\d{2}-\d{2}$/; if(!dateRegex.test(startDate)||!dateRegex.test(endDate)) return res.status(400).json({error:'Invalid date format.'});
  const start=new Date(startDate),end=new Date(endDate); if(end<start) return res.status(400).json({error:'End date cannot be before start date.'});
  const duration=Math.ceil((end-start)/(1000*60*60*24))+1;
  try{ await query('INSERT INTO studentleave (rollno,date,duration,startDate,leaveType,endDate,status) VALUES (?,?,?,?,?,?,?)',[rollno,startDate,String(duration),startDate,leaveType,endDate,'Pending']); res.json({success:true,message:'Student leave submitted.',duration,leaveType,startDate,endDate}); }
  catch(err){res.status(500).json({error:err.message});}
});
app.patch('/api/student-leaves/:id', async(req,res)=>{ const {action}=req.body; if(!['Approved','Rejected'].includes(action)) return res.status(400).json({error:'Action must be Approved or Rejected.'}); try{await query('UPDATE studentleave SET status=? WHERE id=?',[action,req.params.id]);res.json({success:true,message:`Leave ${action}.`});}catch(err){res.status(500).json({error:err.message});} });

// ── FEES ──────────────────────────────────────────────────────────────────────
app.get('/api/fees', async(req,res)=>{ try{res.json(await query('SELECT * FROM fee ORDER BY course'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/fees', async(req,res)=>{ const b=req.body; if(!b.courseCode||!b.course) return res.status(400).json({error:'Course Code and Name required.'}); try{ const ex=await query('SELECT courseCode FROM fee WHERE courseCode=?',[b.courseCode]); if(ex.length) return res.status(409).json({error:`"${b.courseCode}" already exists.`}); await query('INSERT INTO fee (course,semester1,semester2,semester3,semester4,semester5,semester6,semester7,semester8,courseCode,branch) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[b.course,String(b.semester1||0),String(b.semester2||0),String(b.semester3||0),String(b.semester4||0),String(b.semester5||0),String(b.semester6||0),String(b.semester7||0),String(b.semester8||0),b.courseCode,b.branch||null]); res.json({success:true,message:'Fee added.'}); }catch(err){res.status(500).json({error:err.message});} });
app.put('/api/fees/:courseCode', async(req,res)=>{ const code=req.params.courseCode; const b=req.body; if(!b.course) return res.status(400).json({error:'Course name required.'}); try{ const result=await query('UPDATE fee SET course=?,semester1=?,semester2=?,semester3=?,semester4=?,semester5=?,semester6=?,semester7=?,semester8=?,branch=? WHERE courseCode=?',[b.course,String(b.semester1||0),String(b.semester2||0),String(b.semester3||0),String(b.semester4||0),String(b.semester5||0),String(b.semester6||0),String(b.semester7||0),String(b.semester8||0),b.branch||null,code]); if(result.affectedRows===0) return res.status(404).json({error:'Fee record not found.'}); res.json({success:true,message:'Fee updated.'}); }catch(err){res.status(500).json({error:err.message});} });
app.delete('/api/fees/:courseCode', async(req,res)=>{ try{await query('DELETE FROM fee WHERE courseCode=?',[req.params.courseCode]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });
app.get('/api/college-fees', async(req,res)=>{ try{const rollno=req.query.rollno; res.json(rollno?await query('SELECT * FROM collegefee WHERE rollno=?',[rollno]):await query('SELECT * FROM collegefee'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/college-fees', async(req,res)=>{ const b=req.body; try{await query('INSERT INTO collegefee (rollno,course,branch,semester,total) VALUES (?,?,?,?,?)',[b.rollno,b.course,b.branch,b.semester,b.total]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── HOLIDAYS ──────────────────────────────────────────────────────────────────
app.get('/api/holidays', async(req,res)=>{ try{const year=req.query.year; res.json(year?await query('SELECT * FROM holiday WHERE YEAR(holidayDate)=? ORDER BY holidayDate',[year]):await query('SELECT * FROM holiday ORDER BY holidayDate'));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/holidays', async(req,res)=>{
  const {holidayName,holidayDate,holidayType}=req.body;
  if(!holidayName||!holidayDate) return res.status(400).json({error:'Name and date required.'});
  try{
    const ex=await query('SELECT id FROM holiday WHERE holidayDate=?',[holidayDate]);
    if(ex.length) return res.status(409).json({error:`Holiday already exists on ${holidayDate}.`});
    await query('INSERT INTO holiday (holidayName,holidayDate,holidayType) VALUES (?,?,?)',[holidayName,holidayDate,holidayType||'National']);
    res.json({success:true,message:'Holiday added.'});
  }catch(err){res.status(500).json({error:err.message});}
});
app.delete('/api/holidays/:id', async(req,res)=>{ try{await query('DELETE FROM holiday WHERE id=?',[req.params.id]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── DAILY ATTENDANCE ──────────────────────────────────────────────────────────
app.get('/api/daily-attendance', async(req,res)=>{
  const {empId,year,month}=req.query;
  try{
    let sql='SELECT * FROM dailyattendance WHERE 1=1';
    const params=[];
    if(empId){sql+=' AND empId=?';params.push(empId);}
    if(year){sql+=' AND YEAR(attendanceDate)=?';params.push(year);}
    if(month){sql+=' AND MONTH(attendanceDate)=?';params.push(month);}
    sql+=' ORDER BY attendanceDate';
    res.json(await query(sql,params));
  }catch(err){res.status(500).json({error:err.message});}
});

app.post('/api/daily-attendance', async(req,res)=>{
  const {records}=req.body;
  if(!records||!records.length) return res.status(400).json({error:'No records.'});
  try{
    for(const r of records){
      if(!r.empId||!r.attendanceDate) continue;
      // Use INSERT ... ON DUPLICATE KEY UPDATE for free DB (fewer queries)
      await query(
        `INSERT INTO dailyattendance (empId,attendanceDate,status) VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE status=VALUES(status)`,
        [r.empId, r.attendanceDate, r.status||'Present']
      );
    }
    res.json({success:true,message:`${records.length} records saved.`});
  }catch(err){res.status(500).json({error:err.message});}
});

// ── ATTENDANCE SUMMARY ────────────────────────────────────────────────────────
app.get('/api/attendance', async(req,res)=>{
  try{
    const {empId,year}=req.query;
    let sql=`SELECT a.*,t.name AS teacherName,t.department FROM attendance a LEFT JOIN teacher t ON t.empId=a.empId WHERE 1=1`;
    const params=[];
    if(empId){sql+=' AND a.empId=?';params.push(empId);}
    if(year){sql+=' AND a.year=?';params.push(year);}
    sql+=' ORDER BY a.year DESC,t.name';
    res.json(await query(sql,params));
  }catch(err){res.status(500).json({error:err.message});}
});

app.post('/api/attendance', async(req,res)=>{
  const b=req.body;
  if(!b.empId||!b.year) return res.status(400).json({error:'empId and year required.'});
  try{
    await query(
      `INSERT INTO attendance (empId,year,totalDays,sundays,holidays,workingDays,leavesTaken,daysPresent,attendancePct)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE totalDays=VALUES(totalDays),sundays=VALUES(sundays),holidays=VALUES(holidays),
       workingDays=VALUES(workingDays),leavesTaken=VALUES(leavesTaken),daysPresent=VALUES(daysPresent),attendancePct=VALUES(attendancePct)`,
      [b.empId,b.year,b.totalDays||0,b.sundays||0,b.holidays||0,b.workingDays||0,b.leavesTaken||0,b.daysPresent||0,b.attendancePct||0]
    );
    res.json({success:true,message:'Attendance saved.'});
  }catch(err){res.status(500).json({error:err.message});}
});

app.put('/api/attendance/:id', async(req,res)=>{ const b=req.body; try{ const dp=(b.workingDays||0)-(b.leavesTaken||0); const pct=b.workingDays>0?((dp/b.workingDays)*100).toFixed(2):0; await query(`UPDATE attendance SET workingDays=?,leavesTaken=?,daysPresent=?,attendancePct=? WHERE id=?`,[b.workingDays||0,b.leavesTaken||0,dp,pct,req.params.id]); res.json({success:true,daysPresent:dp,attendancePct:pct}); }catch(err){res.status(500).json({error:err.message});} });
app.delete('/api/attendance/:id', async(req,res)=>{ try{await query('DELETE FROM attendance WHERE id=?',[req.params.id]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── TEACHER LEAVE QUOTA ───────────────────────────────────────────────────────
app.get('/api/teacher-leave-quota', async(req,res)=>{ const {empId,year}=req.query; const targetYear=parseInt(year)||new Date().getFullYear(); try{ let sql=`SELECT q.*,t.name AS teacherName,t.department FROM teacher_leave_quota q LEFT JOIN teacher t ON t.empId=q.empId WHERE q.year=?`; const params=[targetYear]; if(empId){sql+=' AND q.empId=?';params.push(empId);} sql+=' ORDER BY t.name,q.leaveTypeName'; res.json(await query(sql,params)); }catch(err){res.status(500).json({error:err.message});} });
app.get('/api/teacher-leave-quota/summary', async(req,res)=>{ const {empId,year}=req.query; if(!empId) return res.status(400).json({error:'empId required'}); const targetYear=parseInt(year)||new Date().getFullYear(); try{ const teacher=await query('SELECT empId,name,department,staffType,gender,maritalStatus FROM teacher WHERE empId=?',[empId]); if(!teacher.length) return res.status(404).json({error:'Teacher not found.'}); const t=teacher[0]; const staffType=t.staffType||'Teaching Staff'; const gender=t.gender||'Any'; const marital=t.maritalStatus||'Any'; const quotas=await query('SELECT leaveTypeName,allocatedDays,notes FROM teacher_leave_quota WHERE empId=? AND year=?',[empId,targetYear]); const globalTypes=await query(`SELECT leaveTypeName,maxDays FROM leavetype WHERE (applicableTo='All' OR applicableTo=?) AND (genderApplicable='Any' OR genderApplicable=?) AND (maritalApplicable='Any' OR maritalApplicable=?)`,[staffType,gender,marital]); const globalMap={}; globalTypes.forEach(g=>{globalMap[g.leaveTypeName]=g.maxDays;}); const quotaMap={...globalMap}; const notesMap={}; quotas.forEach(q=>{quotaMap[q.leaveTypeName]=parseFloat(q.allocatedDays);notesMap[q.leaveTypeName]=q.notes;}); const used=await query(`SELECT leaveType,SUM(CAST(duration AS DECIMAL(6,1))) AS totalUsed FROM teacherleave WHERE empId=? AND LEFT(date,4)=? AND status!='Rejected' GROUP BY leaveType`,[empId,String(targetYear)]); const usedMap={}; used.forEach(u=>{usedMap[u.leaveType]=parseFloat(u.totalUsed)||0;}); const summary=[]; for(const [type,allocated] of Object.entries(quotaMap)){const u=usedMap[type]||0;summary.push({leaveTypeName:type,allocatedDays:allocated,usedDays:u,remainingDays:Math.max(0,allocated-u),notes:notesMap[type]||null,isCustom:quotas.some(q=>q.leaveTypeName===type)});} res.json({empId,teacherName:t.name,department:t.department,staffType,year:targetYear,summary}); }catch(err){res.status(500).json({error:err.message});} });
app.post('/api/teacher-leave-quota', async(req,res)=>{ const {empId,leaveTypeName,allocatedDays,year,notes}=req.body; if(!empId||!leaveTypeName||allocatedDays===undefined) return res.status(400).json({error:'empId, leaveTypeName and allocatedDays required.'}); const targetYear=parseInt(year)||new Date().getFullYear(); try{ const teacher=await query('SELECT empId FROM teacher WHERE empId=?',[empId]); if(!teacher.length) return res.status(404).json({error:'Teacher not found.'}); await query(`INSERT INTO teacher_leave_quota (empId,leaveTypeName,allocatedDays,year,notes) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE allocatedDays=VALUES(allocatedDays),notes=VALUES(notes),updatedAt=CURRENT_TIMESTAMP`,[empId,leaveTypeName,Number(allocatedDays),targetYear,notes||null]); res.json({success:true,message:`Quota saved.`}); }catch(err){res.status(500).json({error:err.message});} });
app.post('/api/teacher-leave-quota/bulk', async(req,res)=>{ const {empId,year,quotas}=req.body; if(!empId||!quotas||!quotas.length) return res.status(400).json({error:'empId and quotas required.'}); const targetYear=parseInt(year)||new Date().getFullYear(); try{ const teacher=await query('SELECT empId FROM teacher WHERE empId=?',[empId]); if(!teacher.length) return res.status(404).json({error:'Teacher not found.'}); for(const q of quotas){if(!q.leaveTypeName||q.allocatedDays===undefined)continue; await query(`INSERT INTO teacher_leave_quota (empId,leaveTypeName,allocatedDays,year,notes) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE allocatedDays=VALUES(allocatedDays),notes=VALUES(notes),updatedAt=CURRENT_TIMESTAMP`,[empId,q.leaveTypeName,Number(q.allocatedDays),targetYear,q.notes||null]);} res.json({success:true,message:`${quotas.length} quota(s) saved.`}); }catch(err){res.status(500).json({error:err.message});} });
app.delete('/api/teacher-leave-quota/:id', async(req,res)=>{ try{await query('DELETE FROM teacher_leave_quota WHERE id=?',[req.params.id]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
app.get('/api/dashboard', async(req,res)=>{
  try{
    const s  = await query('SELECT COUNT(*) AS total FROM student');
    const t  = await query('SELECT COUNT(*) AS total FROM teacher');
    const sl = await query("SELECT COUNT(*) AS total FROM studentleave WHERE status='Pending' OR status IS NULL OR status=''");
    const tl = await query("SELECT COUNT(*) AS total FROM teacherleave WHERE status='Pending' OR status IS NULL OR status=''");
    const recentLeaves = await query(
      `SELECT tl.id, tl.empId, t.name AS teacherName, tl.leaveType,
              tl.startDate, tl.duration, tl.status
         FROM teacherleave tl
         LEFT JOIN teacher t ON t.empId = tl.empId
        WHERE tl.status='Pending' OR tl.status IS NULL OR tl.status=''
        ORDER BY tl.id DESC LIMIT 5`
    );
    res.json({
      totalStudents:        s[0].total,
      totalTeachers:        t[0].total,
      pendingStudentLeaves: sl[0].total,
      pendingTeacherLeaves: tl[0].total,
      recentPendingLeaves:  recentLeaves
    });
  }catch(err){res.status(500).json({error:err.message});}
});

// ── TEACHER ATTENDANCE ────────────────────────────────────────────────────────
app.get('/api/teacher-attendance', async(req,res)=>{ const year=parseInt(req.query.year)||new Date().getFullYear(); try{res.json(await query('SELECT * FROM teacher_attendance WHERE year=? ORDER BY empId',[year]));}catch(err){res.status(500).json({error:err.message});} });
app.post('/api/teacher-attendance/calculate', async(req,res)=>{ const year=parseInt(req.body.year)||new Date().getFullYear(); try{ const teachers=await query('SELECT empId,name FROM teacher'); if(!teachers.length) return res.status(404).json({error:'No teachers found.'}); const total=daysInYear(year); const sundays=countSundaysInYear(year); const working=total-sundays; const leaveRows=await query(`SELECT empId,SUM(CAST(duration AS DECIMAL(6,1))) AS totalLeaves FROM teacherleave WHERE LEFT(date,4)=? AND status!='Rejected' GROUP BY empId`,[String(year)]); const leaveMap={}; leaveRows.forEach(r=>{leaveMap[r.empId]=parseFloat(r.totalLeaves)||0;}); let saved=0; for(const t of teachers){const lt=leaveMap[t.empId]||0;const dp=Math.max(0,working-lt);const pct=working>0?((dp/working)*100).toFixed(2):'0.00'; await query(`INSERT INTO teacher_attendance (empId,teacherName,year,totalDays,sundays,workingDays,leavesTaken,daysPresent,attendancePct) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE teacherName=VALUES(teacherName),totalDays=VALUES(totalDays),sundays=VALUES(sundays),workingDays=VALUES(workingDays),leavesTaken=VALUES(leavesTaken),daysPresent=VALUES(daysPresent),attendancePct=VALUES(attendancePct),updatedAt=CURRENT_TIMESTAMP`,[t.empId,t.name||null,year,total,sundays,working,lt.toFixed(1),dp.toFixed(1),pct]); saved++;} res.json({success:true,message:`Attendance calculated for ${saved} teacher(s).`}); }catch(err){res.status(500).json({error:err.message});} });
app.put('/api/teacher-attendance/:id', async(req,res)=>{ const {workingDays,leavesTaken,daysPresent,attendancePct}=req.body; try{ const result=await query('UPDATE teacher_attendance SET workingDays=?,leavesTaken=?,daysPresent=?,attendancePct=?,updatedAt=CURRENT_TIMESTAMP WHERE id=?',[workingDays,leavesTaken,daysPresent,attendancePct,req.params.id]); if(result.affectedRows===0) return res.status(404).json({error:'Record not found.'}); res.json({success:true}); }catch(err){res.status(500).json({error:err.message});} });
app.delete('/api/teacher-attendance/:id', async(req,res)=>{ try{await query('DELETE FROM teacher_attendance WHERE id=?',[req.params.id]);res.json({success:true});}catch(err){res.status(500).json({error:err.message});} });

// ── START ─────────────────────────────────────────────────────────────────────
initDB().then(()=>{
  app.listen(PORT, ()=>{ console.log(`🚀 UMS API running on port ${PORT}`); });
});