package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;
import net.proteanit.sql.DbUtils;

public class FeeStructure extends JFrame {
    
    FeeStructure() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Fee Structure");
        
        setSize(1000, 700);
        setLocation(250, 50);
        setLayout(null);
        
        JLabel heading = new JLabel("Fee Structure");
        heading.setBounds(50, 10, 400, 30);
        Theme.styleLabel(heading, 30, true);
        add(heading);
        
        JTable table = new JTable();
        table.setBackground(new Color(80, 30, 150));
        table.setForeground(Theme.TEXT);
        table.setGridColor(Theme.GOLD);

        JScrollPane jsp = new JScrollPane(table);
        jsp.setBounds(0, 60, 1000, 380);
        jsp.setBackground(Theme.PANEL_BG);
        add(jsp);

        table.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                int selectedRow = table.getSelectedRow();
                if (selectedRow >= 0) {
                    String courseValue = table.getValueAt(selectedRow, 0).toString();
                    String branchValue = table.getValueAt(selectedRow, 1).toString();
                    String semesterValue = table.getValueAt(selectedRow, 2).toString();
                    String annualValue = table.getValueAt(selectedRow, 3).toString();

                    txtCourse.setText(courseValue);
                    txtBranch.setText(branchValue);
                    txtSemesterFee.setText(semesterValue);
                    txtAnnualFee.setText(annualValue);
                }
            }
        });

        JPanel formPanel = new JPanel();
        formPanel.setBounds(20, 460, 960, 180);
        formPanel.setBackground(new Color(20, 18, 40, 220));
        formPanel.setBorder(BorderFactory.createLineBorder(new Color(140, 60, 255), 2, true));
        formPanel.setLayout(null);
        add(formPanel);

        JLabel formTitle = new JLabel("Add / Modify Fee Structure");
        formTitle.setForeground(new Color(243, 143, 255));
        formTitle.setBounds(20, 10, 400, 25);
        formTitle.setFont(new Font("Segoe UI", Font.BOLD, 20));
        formPanel.add(formTitle);

        JLabel lblCourse = new JLabel("Course");
        lblCourse.setForeground(Theme.TEXT);
        lblCourse.setBounds(20, 50, 80, 25);
        Theme.styleLabel(lblCourse, 16, true);
        formPanel.add(lblCourse);

        JTextField txtCourse = new JTextField();
        txtCourse.setBounds(110, 50, 180, 25);
        txtCourse.setBackground(new Color(30, 15, 70));
        txtCourse.setForeground(Theme.TEXT);
        formPanel.add(txtCourse);

        JLabel lblBranch = new JLabel("Branch");
        lblBranch.setForeground(Theme.TEXT);
        lblBranch.setBounds(320, 50, 80, 25);
        Theme.styleLabel(lblBranch, 16, true);
        formPanel.add(lblBranch);

        JTextField txtBranch = new JTextField();
        txtBranch.setBounds(400, 50, 180, 25);
        txtBranch.setBackground(new Color(30, 15, 70));
        txtBranch.setForeground(Theme.TEXT);
        formPanel.add(txtBranch);

        JLabel lblSemesterFee = new JLabel("Semester Fee");
        lblSemesterFee.setForeground(Theme.TEXT);
        lblSemesterFee.setBounds(20, 95, 100, 25);
        Theme.styleLabel(lblSemesterFee, 16, true);
        formPanel.add(lblSemesterFee);

        JTextField txtSemesterFee = new JTextField();
        txtSemesterFee.setBounds(120, 95, 170, 25);
        txtSemesterFee.setBackground(new Color(30, 15, 70));
        txtSemesterFee.setForeground(Theme.TEXT);
        formPanel.add(txtSemesterFee);

        JLabel lblAnnualFee = new JLabel("Annual Fee");
        lblAnnualFee.setForeground(Theme.TEXT);
        lblAnnualFee.setBounds(310, 95, 100, 25);
        Theme.styleLabel(lblAnnualFee, 16, true);
        formPanel.add(lblAnnualFee);

        JTextField txtAnnualFee = new JTextField();
        txtAnnualFee.setBounds(410, 95, 170, 25);
        txtAnnualFee.setBackground(new Color(30, 15, 70));
        txtAnnualFee.setForeground(Theme.TEXT);
        formPanel.add(txtAnnualFee);

        JButton btnSave = new JButton("Save/Update");
        btnSave.setBounds(620, 50, 130, 30);
        Theme.styleButton(btnSave);
        formPanel.add(btnSave);

        JButton btnDelete = new JButton("Delete");
        btnDelete.setBounds(620, 95, 130, 30);
        Theme.styleButton(btnDelete);
        formPanel.add(btnDelete);

        JButton btnRefresh = new JButton("Refresh");
        btnRefresh.setBounds(760, 50, 130, 30);
        Theme.styleButton(btnRefresh);
        formPanel.add(btnRefresh);

        // Database refresh and load
        loadDatabaseFeeStructure(table);

        btnSave.addActionListener(e -> {
            String course = txtCourse.getText().trim();
            String branch = txtBranch.getText().trim();
            String semesterFee = txtSemesterFee.getText().trim();
            String annualFee = txtAnnualFee.getText().trim();

            if (course.isEmpty() || branch.isEmpty() || semesterFee.isEmpty() || annualFee.isEmpty()) {
                JOptionPane.showMessageDialog(null, "Please fill all fields.", "Validation", JOptionPane.WARNING_MESSAGE);
                return;
            }

            try {
                Conn c = new Conn();
                ResultSet rs = c.s.executeQuery("select * from fee where course = '" + course + "' and branch = '" + branch + "'");
                if (rs.next()) {
                    String update = "update fee set SemesterFee='" + semesterFee + "', AnnualFee='" + annualFee + "', "
                            + "Semester1='" + semesterFee + "', Semester2='" + semesterFee + "', Semester3='" + semesterFee + "', Semester4='" + semesterFee + "', "
                            + "Semester5='" + semesterFee + "', Semester6='" + semesterFee + "', Semester7='" + semesterFee + "', Semester8='" + semesterFee + "' "
                            + "where course='" + course + "' and branch='" + branch + "'";
                    c.s.executeUpdate(update);
                    JOptionPane.showMessageDialog(null, "Fee structure updated successfully.", "Success", JOptionPane.INFORMATION_MESSAGE);
                } else {
                    String insert = "insert into fee(course, branch, Semester1, Semester2, Semester3, Semester4, Semester5, Semester6, Semester7, Semester8, SemesterFee, AnnualFee) values('"
                            + course + "','" + branch + "','" + semesterFee + "','" + semesterFee + "','" + semesterFee + "','" + semesterFee + "','" + semesterFee + "','"
                            + semesterFee + "','" + semesterFee + "','" + semesterFee + "','" + semesterFee + "','" + annualFee + "')";
                    c.s.executeUpdate(insert);
                    JOptionPane.showMessageDialog(null, "Fee structure added successfully.", "Success", JOptionPane.INFORMATION_MESSAGE);
                }
                loadDatabaseFeeStructure(table);
            } catch (Exception ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(null, "Error saving fee structure: " + ex.getMessage(), "Database error", JOptionPane.ERROR_MESSAGE);
            }
        });

        btnDelete.addActionListener(e -> {
            String course = txtCourse.getText().trim();
            String branch = txtBranch.getText().trim();

            if (course.isEmpty() || branch.isEmpty()) {
                JOptionPane.showMessageDialog(null, "Please enter course and branch to delete.", "Validation", JOptionPane.WARNING_MESSAGE);
                return;
            }

            try {
                Conn c = new Conn();
                int confirm = JOptionPane.showConfirmDialog(null, "Delete fee structure for " + course + " (" + branch + ")?", "Confirm Delete", JOptionPane.YES_NO_OPTION);
                if (confirm == JOptionPane.YES_OPTION) {
                    c.s.executeUpdate("delete from fee where course='" + course + "' and branch='" + branch + "'");
                    JOptionPane.showMessageDialog(null, "Fee structure deleted.", "Deleted", JOptionPane.INFORMATION_MESSAGE);
                    loadDatabaseFeeStructure(table);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(null, "Error deleting fee structure: " + ex.getMessage(), "Database error", JOptionPane.ERROR_MESSAGE);
            }
        });

        btnRefresh.addActionListener(e -> loadDatabaseFeeStructure(table));

        setVisible(true);
        
    }
    
    private void loadDatabaseFeeStructure(JTable table) {
        try {
            Conn c = new Conn();
            c.s.executeUpdate("ALTER TABLE fee ADD COLUMN IF NOT EXISTS SemesterFee VARCHAR(20);");
            c.s.executeUpdate("ALTER TABLE fee ADD COLUMN IF NOT EXISTS AnnualFee VARCHAR(20);");

            c.s.executeUpdate("UPDATE fee SET SemesterFee = Semester1 WHERE SemesterFee IS NULL OR SemesterFee = '';");
            c.s.executeUpdate("UPDATE fee SET AnnualFee = (Semester1 + Semester2) WHERE AnnualFee IS NULL OR AnnualFee = '';");

            ResultSet rsCount = c.s.executeQuery("select count(*) as total from fee");
            int count = 0;
            if (rsCount.next()) {
                count = rsCount.getInt("total");
            }

            if (count == 0) {
                String seed = "insert into fee(course, branch, Semester1, Semester2, Semester3, Semester4, Semester5, Semester6, Semester7, Semester8, SemesterFee, AnnualFee) values"
                        + "('BTech','Computer Science','22000','22000','22000','22000','22000','22000','22000','22000','22000','44000'),"
                        + "('BTech','Mechanical','21000','21000','21000','21000','21000','21000','21000','21000','21000','42000'),"
                        + "('BBA','Business Administration','12500','12500','12500','12500','12500','12500','12500','12500','12500','25000'),"
                        + "('BCA','Computer Applications','17000','17000','17000','17000','17000','17000','17000','17000','17000','34000'),"
                        + "('BA','Arts','9000','9000','9000','9000','9000','9000','9000','9000','9000','18000'),"
                        + "('BCOM','Commerce','11000','11000','11000','11000','11000','11000','11000','11000','11000','22000'),"
                        + "('BSc','Science','13000','13000','13000','13000','13000','13000','13000','13000','13000','26000'),"
                        + "('MBA','Business Management','28000','28000','28000','28000','28000','28000','28000','28000','28000','56000')";
                c.s.executeUpdate(seed);
            }

            ResultSet rs = c.s.executeQuery("select course AS 'Course', branch AS 'Branch', SemesterFee AS 'Semester Fee', AnnualFee AS 'Annual Fee' from fee");

            table.setModel(DbUtils.resultSetToTableModel(rs));
            table.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 14));
            table.setRowHeight(30);
            table.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
        } catch (Exception e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(null, "Could not load Fee Structure from database: " + e.getMessage(), "Database error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    public static void main(String[] args) {
        new FeeStructure();
    }
}
