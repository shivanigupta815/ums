package university.management.system;

import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;
import java.sql.*;
import net.proteanit.sql.DbUtils;
import java.awt.event.*;

public class TeacherLeaveDetails extends JFrame implements ActionListener {

    Choice cEmpId;
    JTable table;
    JButton search, print, cancel;

    TeacherLeaveDetails() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Teacher Leave Details");

        getContentPane().setBackground(Theme.DEEP_PURPLE);
        setLayout(null);

        JLabel heading = new JLabel("Search by Employee Id");
        heading.setBounds(20, 20, 150, 20);
        Theme.styleLabel(heading, 16, false);
        add(heading);

        cEmpId = new Choice();
        cEmpId.setBounds(180, 20, 150, 20);
        cEmpId.setBackground(new Color(80, 30, 150));
        cEmpId.setForeground(Theme.TEXT);
        add(cEmpId);

        try {
            Conn c = new Conn();
            ResultSet rs = c.s.executeQuery("select * from teacher");
            while (rs.next()) {
                cEmpId.add(rs.getString("empId"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        table = new JTable();

        // ── Fix 1: Cell renderer — light background so text is always visible ──
        DefaultTableCellRenderer cellRenderer = new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(
                    JTable t, Object value, boolean isSelected,
                    boolean hasFocus, int row, int col) {
                Component c = super.getTableCellRendererComponent(t, value, isSelected, hasFocus, row, col);
                if (isSelected) {
                    c.setBackground(new Color(100, 60, 180));
                    c.setForeground(Color.WHITE);
                } else {
                    c.setBackground(row % 2 == 0 ? new Color(245, 240, 255) : Color.WHITE);
                    c.setForeground(Color.BLACK);
                }
                return c;
            }
        };
        table.setDefaultRenderer(Object.class, cellRenderer);

        // ── Fix 2: Header renderer — styled header, not pitch black ─────────
        JTableHeader header = table.getTableHeader();
        header.setDefaultRenderer(new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(
                    JTable t, Object value, boolean isSelected,
                    boolean hasFocus, int row, int col) {
                JLabel lbl = new JLabel(value != null ? value.toString() : "");
                lbl.setOpaque(true);
                lbl.setBackground(new Color(60, 20, 120));
                lbl.setForeground(Color.WHITE);
                lbl.setFont(lbl.getFont().deriveFont(Font.BOLD, 13f));
                lbl.setBorder(BorderFactory.createMatteBorder(0, 0, 2, 1, new Color(180, 150, 255)));
                lbl.setHorizontalAlignment(SwingConstants.LEFT);
                lbl.setBorder(BorderFactory.createCompoundBorder(
                        BorderFactory.createMatteBorder(0, 0, 2, 1, new Color(180, 150, 255)),
                        BorderFactory.createEmptyBorder(4, 8, 4, 8)));
                return lbl;
            }
        });
        header.setBackground(new Color(60, 20, 120));
        header.setForeground(Color.WHITE);

        table.setRowHeight(26);
        table.setGridColor(new Color(180, 150, 255));
        table.setShowGrid(true);

        try {
            Conn c = new Conn();
            ResultSet rs = c.s.executeQuery("select * from teacherleave");
            table.setModel(DbUtils.resultSetToTableModel(rs));
        } catch (Exception e) {
            e.printStackTrace();
        }

        JScrollPane jsp = new JScrollPane(table);
        jsp.setBounds(0, 100, 900, 560);
        jsp.setBackground(Theme.DEEP_PURPLE);
        jsp.getViewport().setBackground(Color.WHITE);
        add(jsp);

        search = new JButton("Search");
        search.setBounds(20, 70, 80, 25);
        Theme.styleButton(search);
        search.addActionListener(this);
        add(search);

        print = new JButton("Print");
        print.setBounds(120, 70, 80, 25);
        Theme.styleButton(print);
        print.addActionListener(this);
        add(print);

        cancel = new JButton("Cancel");
        cancel.setBounds(220, 70, 80, 25);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);

        setSize(900, 700);
        setLocation(300, 100);
        setVisible(true);
    }

    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == search) {
            String query = "select * from teacherleave where empId = '" + cEmpId.getSelectedItem() + "'";
            try {
                Conn c = new Conn();
                ResultSet rs = c.s.executeQuery(query);
                table.setModel(DbUtils.resultSetToTableModel(rs));
                // Re-apply renderer after model change
                table.setDefaultRenderer(Object.class, table.getDefaultRenderer(Object.class));
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else if (ae.getSource() == print) {
            try {
                table.print();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            setVisible(false);
        }
    }

    public static void main(String[] args) {
        new TeacherLeaveDetails();
    }
}