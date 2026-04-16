package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.sql.*;
import com.toedter.calendar.JDateChooser;
import java.awt.event.*;
import java.text.SimpleDateFormat;

public class TeacherLeave extends JFrame implements ActionListener {

    Choice cEmpId, ctime, cLeaveType;
    JDateChooser dcdate;
    JButton submit, cancel, showBalance;
    JLabel lblSummary;

    // ── Leave limits (must match server.js LEAVE_LIMITS) ──────────────────
    private final double MAX_MEDICAL = 10.0;
    private final double MAX_CASUAL  = 12.0;
    private final double MAX_DUTY    = 10.0;
    private final double MAX_COMPOFF =  5.0;

    TeacherLeave() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Apply Leave (Teacher)");

        setSize(520, 580);
        setLocation(550, 100);
        setLayout(null);
        getContentPane().setBackground(Theme.DEEP_PURPLE);

        // ── Heading ──────────────────────────────────────────────────────
        JLabel heading = new JLabel("Apply Leave (Teacher)");
        heading.setBounds(40, 30, 340, 35);
        Theme.styleLabel(heading, 20, true);
        add(heading);

        // ── Employee ID ───────────────────────────────────────────────────
        JLabel lblEmpId = new JLabel("Employee ID");
        lblEmpId.setBounds(40, 85, 200, 20);
        Theme.styleLabel(lblEmpId, 14, false);
        add(lblEmpId);

        cEmpId = new Choice();
        cEmpId.setBounds(40, 110, 200, 22);
        cEmpId.setBackground(new Color(80, 30, 150));
        cEmpId.setForeground(Theme.TEXT);
        add(cEmpId);

        // ── Populate employee IDs from DB ──────────────────────────────
        try {
            Conn c = new Conn();
            ResultSet rs = c.s.executeQuery("SELECT empId FROM teacher ORDER BY empId");
            while (rs.next()) {
                cEmpId.add(rs.getString("empId"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(null, "Could not load employee IDs: " + e.getMessage());
        }

        // ── Date (JDateChooser) ───────────────────────────────────────────
        JLabel lblDate = new JLabel("Date");
        lblDate.setBounds(40, 150, 200, 20);
        Theme.styleLabel(lblDate, 14, false);
        add(lblDate);

        dcdate = new JDateChooser();
        dcdate.setBounds(40, 175, 200, 28);
        // FIX: explicit format ensures consistent yyyy-MM-dd output for MySQL
        dcdate.setDateFormatString("yyyy-MM-dd");
        dcdate.setBackground(new Color(80, 30, 150));
        dcdate.setForeground(Theme.TEXT);
        add(dcdate);

        // ── Time Duration ─────────────────────────────────────────────────
        JLabel lblTime = new JLabel("Duration");
        lblTime.setBounds(40, 220, 200, 20);
        Theme.styleLabel(lblTime, 14, false);
        add(lblTime);

        ctime = new Choice();
        ctime.setBounds(40, 245, 200, 22);
        ctime.setBackground(new Color(80, 30, 150));
        ctime.setForeground(Theme.TEXT);
        ctime.add("Full Day");
        ctime.add("Half Day");
        add(ctime);

        // ── Leave Type ────────────────────────────────────────────────────
        JLabel lblLeaveType = new JLabel("Leave Type");
        lblLeaveType.setBounds(280, 220, 200, 20);
        Theme.styleLabel(lblLeaveType, 14, false);
        add(lblLeaveType);

        cLeaveType = new Choice();
        cLeaveType.setBounds(280, 245, 180, 22);
        cLeaveType.setBackground(new Color(80, 30, 150));
        cLeaveType.setForeground(Theme.TEXT);
        cLeaveType.add("Medical");
        cLeaveType.add("Casual");
        cLeaveType.add("Duty");
        cLeaveType.add("Compoff");
        add(cLeaveType);

        // ── Buttons ───────────────────────────────────────────────────────
        submit = new JButton("Submit");
        submit.setBounds(40, 300, 110, 30);
        Theme.styleButton(submit);
        submit.addActionListener(this);
        add(submit);

        cancel = new JButton("Cancel");
        cancel.setBounds(165, 300, 110, 30);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);

        showBalance = new JButton("Show Balance");
        showBalance.setBounds(290, 300, 130, 30);
        Theme.styleButton(showBalance);
        showBalance.addActionListener(this);
        add(showBalance);

        // ── Balance Summary Label ─────────────────────────────────────────
        lblSummary = new JLabel("<html><i>Select a teacher and click Show Balance</i></html>");
        lblSummary.setBounds(40, 350, 420, 180);
        lblSummary.setForeground(Theme.TEXT);
        lblSummary.setVerticalAlignment(SwingConstants.TOP);
        add(lblSummary);

        setVisible(true);
    }

    // ── Action Handler ────────────────────────────────────────────────────
    @Override
    public void actionPerformed(ActionEvent ae) {

        if (ae.getSource() == showBalance) {
            // ── Show Balance ──────────────────────────────────────────────
            updateLeaveSummary(cEmpId.getSelectedItem());

        } else if (ae.getSource() == cancel) {
            // ── Cancel ───────────────────────────────────────────────────
            setVisible(false);

        } else if (ae.getSource() == submit) {
            // ── Submit ────────────────────────────────────────────────────
            String empId     = cEmpId.getSelectedItem();
            String durType   = ctime.getSelectedItem();
            String leaveType = cLeaveType.getSelectedItem();

            // FIX: read date using getDate(), NOT the text field
            java.util.Date selectedDate = dcdate.getDate();
            if (selectedDate == null) {
                JOptionPane.showMessageDialog(
                    this,
                    "Please select a date.",
                    "Missing Date",
                    JOptionPane.WARNING_MESSAGE
                );
                return;
            }

            // Format to yyyy-MM-dd for consistent MySQL storage
            String date = new SimpleDateFormat("yyyy-MM-dd").format(selectedDate);

            // ── Check leave balance ───────────────────────────────────────
            LeaveCounts counts = getLeaveCounts(empId);
            double requestedLeave = "Half Day".equals(durType) ? 0.5 : 1.0;

            double limit = getLimit(leaveType);
            double used  = getUsed(counts, leaveType);

            if (used + requestedLeave > limit) {
                JOptionPane.showMessageDialog(
                    this,
                    "<html>Cannot apply leave.<br>" +
                    "<b>" + leaveType + "</b> leave limit is <b>" + limit + " days/year</b>.<br>" +
                    "Used: <b>" + used + "</b> days &nbsp;|&nbsp; Remaining: <b>" + Math.max(0, limit - used) + "</b> days.</html>",
                    "Leave Limit Exceeded",
                    JOptionPane.ERROR_MESSAGE
                );
                return;
            }

            // ── Confirmation dialog ───────────────────────────────────────
            int confirm = JOptionPane.showOptionDialog(
                this,
                "<html>" +
                "<div style='font-size:13px;'>" +
                "<b>Confirm Leave Application</b><br><br>" +
                "Employee ID : <b>" + empId     + "</b><br>" +
                "Date        : <b>" + date       + "</b><br>" +
                "Leave Type  : <b>" + leaveType  + "</b><br>" +
                "Duration    : <b>" + durType    + "</b><br><br>" +
                "<span style='color:gray;'>Do you want to grant this leave?</span>" +
                "</div></html>",
                "Confirm Leave",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.QUESTION_MESSAGE,
                null,
                new Object[]{ "✔  Confirm Leave", "✘  Cancel" },
                "✔  Confirm Leave"
            );

            if (confirm != 0) return; // user clicked Cancel or closed dialog

            // ── Save to DB ────────────────────────────────────────────────
            String sql = "INSERT INTO teacherleave(empId, date, leaveType, duration) "
                       + "VALUES(?, ?, ?, ?)";
            try {
                Conn c = new Conn();
                // Use PreparedStatement to avoid SQL injection
                PreparedStatement ps = c.con.prepareStatement(sql);
                ps.setString(1, empId);
                ps.setString(2, date);
                ps.setString(3, leaveType);
                ps.setString(4, durType);
                ps.executeUpdate();

                JOptionPane.showMessageDialog(
                    this,
                    "<html>✅ <b>Leave Confirmed!</b><br>" +
                    "Leave for <b>" + empId + "</b> on <b>" + date + "</b> has been recorded.</html>",
                    "Success",
                    JOptionPane.INFORMATION_MESSAGE
                );

                // Refresh balance and reset date
                updateLeaveSummary(empId);
                dcdate.setDate(null);

            } catch (Exception e) {
                e.printStackTrace();
                JOptionPane.showMessageDialog(
                    this,
                    "<html>❌ Error saving leave:<br>" + e.getMessage() + "<br><br>" +
                    "Make sure the <b>teacherleave</b> table has columns:<br>" +
                    "<code>empId, date, leaveType, duration</code></html>",
                    "Database Error",
                    JOptionPane.ERROR_MESSAGE
                );
            }
        }
    }

    // ── Update balance label ───────────────────────────────────────────────
    private void updateLeaveSummary(String empId) {
        LeaveCounts counts = getLeaveCounts(empId);

        double remMed  = Math.max(0, MAX_MEDICAL  - counts.medical);
        double remCas  = Math.max(0, MAX_CASUAL   - counts.casual);
        double remDuty = Math.max(0, MAX_DUTY     - counts.duty);
        double remComp = Math.max(0, MAX_COMPOFF  - counts.compoff);

        lblSummary.setText(
            "<html>" +
            "<b>Leave Balance for " + empId + "</b><br><br>" +
            "<table style='border-spacing:8px 2px;'>" +
            "<tr><td><b>Type</b></td><td><b>Used</b></td><td><b>Remaining</b></td></tr>" +
            "<tr><td>Medical</td> <td>" + counts.medical + "</td><td>" + remMed  + " / " + MAX_MEDICAL  + "</td></tr>" +
            "<tr><td>Casual</td>  <td>" + counts.casual  + "</td><td>" + remCas  + " / " + MAX_CASUAL   + "</td></tr>" +
            "<tr><td>Duty</td>    <td>" + counts.duty    + "</td><td>" + remDuty + " / " + MAX_DUTY     + "</td></tr>" +
            "<tr><td>Compoff</td> <td>" + counts.compoff + "</td><td>" + remComp + " / " + MAX_COMPOFF  + "</td></tr>" +
            "</table></html>"
        );
    }

    // ── Fetch leave counts from DB ─────────────────────────────────────────
    private LeaveCounts getLeaveCounts(String empId) {
        LeaveCounts counts = new LeaveCounts();
        try {
            Conn c = new Conn();
            String sql = "SELECT leaveType, duration FROM teacherleave WHERE empId = ?";
            PreparedStatement ps = c.con.prepareStatement(sql);
            ps.setString(1, empId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                String type     = rs.getString("leaveType");
                String duration = rs.getString("duration");
                if (type == null) continue; // skip old rows without leaveType

                double val = "Half Day".equals(duration) ? 0.5 : 1.0;
                switch (type) {
                    case "Medical": counts.medical += val; break;
                    case "Casual":  counts.casual  += val; break;
                    case "Duty":    counts.duty    += val; break;
                    case "Compoff": counts.compoff += val; break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return counts;
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private double getLimit(String leaveType) {
        switch (leaveType) {
            case "Medical": return MAX_MEDICAL;
            case "Casual":  return MAX_CASUAL;
            case "Duty":    return MAX_DUTY;
            case "Compoff": return MAX_COMPOFF;
            default:        return MAX_CASUAL;
        }
    }

    private double getUsed(LeaveCounts c, String leaveType) {
        switch (leaveType) {
            case "Medical": return c.medical;
            case "Casual":  return c.casual;
            case "Duty":    return c.duty;
            case "Compoff": return c.compoff;
            default:        return c.casual;
        }
    }

    // ── Inner class for leave counts ──────────────────────────────────────
    private static class LeaveCounts {
        double medical = 0, casual = 0, duty = 0, compoff = 0;
    }

    public static void main(String[] args) {
        new TeacherLeave();
    }
}