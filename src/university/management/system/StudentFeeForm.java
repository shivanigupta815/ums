package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.sql.*;
import java.awt.event.*;

public class StudentFeeForm extends JFrame implements ActionListener {

    Choice crollno;
    JComboBox cbcourse, cbbranch, cbsemester;
    JLabel labeltotal;
    JButton update, pay, back;
    
    StudentFeeForm() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Student Fee Form");
        
        setSize(900, 500);
        setLocation(300, 100);
        setLayout(null);
        
        getContentPane().setBackground(Theme.DEEP_PURPLE);
        
        ImageIcon i1 = new ImageIcon(ClassLoader.getSystemResource("icons/fee.jpg"));
        Image i2 = i1.getImage().getScaledInstance(500, 300, Image.SCALE_DEFAULT);
        ImageIcon i3 = new ImageIcon(i2);
        JLabel image = new JLabel(i3);
        image.setBounds(400, 50, 500, 300);
        add(image);
        
        JLabel lblrollnumber = new JLabel("Select Roll No");
        lblrollnumber.setBounds(40, 60, 150, 20);
        Theme.styleLabel(lblrollnumber, 16, false);
        add(lblrollnumber);
        
        crollno = new Choice();
        crollno.setBounds(200, 60, 150, 20);
        crollno.setBackground(new Color(80, 30, 150));
        crollno.setForeground(Theme.TEXT);
        add(crollno);
        
        try {
            Conn c = new Conn();
            ResultSet rs = c.s.executeQuery("select * from student");
            while(rs.next()) {
                crollno.add(rs.getString("rollno"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        JLabel lblname = new JLabel("Name");
        lblname.setBounds(40, 100, 150, 20);
        Theme.styleLabel(lblname, 16, true);
        add(lblname);
        
        JLabel labelname = new JLabel();
        labelname.setBounds(200, 100, 150, 20);
        Theme.styleLabel(labelname, 16, false);
        add(labelname);
        
        JLabel lblfname = new JLabel("Father's Name");
        lblfname.setBounds(40, 140, 150, 20);
        Theme.styleLabel(lblfname, 16, true);
        add(lblfname);
        
        JLabel labelfname = new JLabel();
        labelfname.setBounds(200, 140, 150, 20);
        Theme.styleLabel(labelfname, 16, false);
        add(labelfname);
        
        try {
            Conn c = new Conn();
            String query = "select * from student where rollno='"+crollno.getSelectedItem()+"'";
            ResultSet rs = c.s.executeQuery(query);
            while(rs.next()) {
                labelname.setText(rs.getString("name"));
                labelfname.setText(rs.getString("fname"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        crollno.addItemListener(new ItemListener() {
            public void itemStateChanged(ItemEvent ie) {
                try {
                    Conn c = new Conn();
                    String query = "select * from student where rollno='"+crollno.getSelectedItem()+"'";
                    ResultSet rs = c.s.executeQuery(query);
                    while(rs.next()) {
                        labelname.setText(rs.getString("name"));
                        labelfname.setText(rs.getString("fname"));
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
        
        JLabel lblcourse = new JLabel("Course");
        lblcourse.setBounds(40, 180, 150, 20);
        Theme.styleLabel(lblcourse, 16, true);
        add(lblcourse);
        
        String course[] = {"BTech", "BBA", "BCA", "Bsc", "Msc", "MBA", "MCA", "MCom", "MA", "BA"};
        cbcourse = new JComboBox(course);
        cbcourse.setBounds(200, 180, 150, 20);
        cbcourse.setBackground(new Color(80, 30, 150));
        cbcourse.setForeground(Theme.TEXT);
        add(cbcourse);
        
        JLabel lblbranch = new JLabel("Branch");
        lblbranch.setBounds(40, 220, 150, 20);
        Theme.styleLabel(lblbranch, 16, true);
        add(lblbranch);
        
        String branch[] = {"Computer Science", "Electronics", "Mechanical", "Civil", "IT"};
        cbbranch = new JComboBox(branch);
        cbbranch.setBounds(200, 220, 150, 20);
        cbbranch.setBackground(new Color(80, 30, 150));
        cbbranch.setForeground(Theme.TEXT);
        add(cbbranch);
        
        JLabel lblsemester = new JLabel("Semester");
        lblsemester.setBounds(40, 260, 150, 20);
        Theme.styleLabel(lblsemester, 16, true);
        add(lblsemester);
        
        String semester[] = {"Semester1", "Semester2", "Semester3", "Semester4", "Semester5", "Semester6", "Semester7", "Semester8" };
        cbsemester = new JComboBox(semester);
        cbsemester.setBounds(200, 260, 150, 20);
        cbsemester.setBackground(new Color(80, 30, 150));
        cbsemester.setForeground(Theme.TEXT);
        add(cbsemester);
        
        JLabel lbltotal = new JLabel("Total Payable");
        lbltotal.setBounds(40, 300, 150, 20);
        Theme.styleLabel(lbltotal, 16, true);
        add(lbltotal);
        
        labeltotal = new JLabel();
        labeltotal.setBounds(200, 300, 150, 20);
        Theme.styleLabel(labeltotal, 16, false);
        add(labeltotal);
        
        update = new JButton("Update");
        update.setBounds(30, 380, 100, 25);
        Theme.styleButton(update);
        update.addActionListener(this);
        add(update);
        
        pay = new JButton("Pay Fee");
        pay.setBounds(150, 380, 100, 25);
        Theme.styleButton(pay);
        pay.addActionListener(this);
        add(pay);
        
        back = new JButton("Back");
        back.setBounds(270, 380, 100, 25);
        Theme.styleButton(back);
        back.addActionListener(this);
        add(back);
        
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == update) {
            String course = (String) cbcourse.getSelectedItem();
            String branch = (String) cbbranch.getSelectedItem();
            String semester = (String) cbsemester.getSelectedItem();
            try {
                Conn c = new Conn();
                String query = "select * from fee where course = '" + course + "' and branch = '" + branch + "'";
                ResultSet rs = c.s.executeQuery(query);
                if (rs.next()) {
                    String feeValue = null;
                    try {
                        feeValue = rs.getString(semester);
                    } catch (SQLException ignored) {
                    }
                    if (feeValue == null || feeValue.trim().isEmpty()) {
                        feeValue = rs.getString("SemesterFee");
                    }
                    if (feeValue == null || feeValue.trim().isEmpty()) {
                        feeValue = "0";
                    }
                    labeltotal.setText(feeValue);
                } else {
                    labeltotal.setText("0");
                    JOptionPane.showMessageDialog(this, "No fee record found for selected course/branch.", "Info", JOptionPane.INFORMATION_MESSAGE);
                }
            } catch (Exception e) {
                e.printStackTrace();
                JOptionPane.showMessageDialog(this, "Unable to fetch fee from DB: " + e.getMessage(), "Database error", JOptionPane.ERROR_MESSAGE);
            }
        } else if (ae.getSource() == pay) {
            String rollno = crollno.getSelectedItem();
            String course = (String) cbcourse.getSelectedItem();
            String semester = (String) cbsemester.getSelectedItem();
            String branch = (String) cbbranch.getSelectedItem();
            String total = labeltotal.getText();
            
            try {
                Conn c = new Conn();
                
                String query = "insert into collegefee values('"+rollno+"', '"+course+"', '"+branch+"', '"+semester+"', '"+total+"')";
                c.s.executeUpdate(query);
                
                JOptionPane.showMessageDialog(null, "College fee submitted successfully");
                setVisible(false);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            setVisible(false);
        }
    }

    public static void main(String[] args) {
        new StudentFeeForm();
    }
}
