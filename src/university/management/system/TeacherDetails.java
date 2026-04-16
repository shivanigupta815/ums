package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.sql.*;
import net.proteanit.sql.DbUtils;
import java.awt.event.*;

public class TeacherDetails extends JFrame implements ActionListener {

    Choice cEmpId;
    JTable table;
    JButton search, print, update, add, cancel;
    
    TeacherDetails() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Teacher Details");
        
        setLayout(null);
        
        JLabel heading = new JLabel("Search by Employee Id");
        heading.setBounds(20, 20, 150, 20);
        Theme.styleLabel(heading, 14, false);
        add(heading);
        
        cEmpId = new Choice();
        cEmpId.setBounds(180, 20, 150, 20);
        cEmpId.setBackground(new Color(80, 30, 150));
        cEmpId.setForeground(Theme.TEXT);
        add(cEmpId);
        
        try {
            Conn c = new Conn();
            ResultSet rs = c.s.executeQuery("select * from teacher");
            while(rs.next()) {
                cEmpId.add(rs.getString("empId"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        table = new JTable();
        table.setBackground(new Color(80, 30, 150));
        table.setForeground(Theme.TEXT);
        table.setGridColor(Theme.GOLD);
        
        try {
            Conn c = new Conn();
            ResultSet rs = c.s.executeQuery("select * from teacher");
            table.setModel(DbUtils.resultSetToTableModel(rs));
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        JScrollPane jsp = new JScrollPane(table);
        jsp.setBounds(0, 100, 900, 600);
        jsp.setBackground(Theme.PANEL_BG);
        add(jsp);
        
        search = new JButton("Search");
        search.setBounds(20, 70, 80, 20);
        Theme.styleButton(search);
        search.addActionListener(this);
        add(search);
        
        print = new JButton("Print");
        print.setBounds(120, 70, 80, 20);
        Theme.styleButton(print);
        print.addActionListener(this);
        add(print);
        
        add = new JButton("Add");
        add.setBounds(220, 70, 80, 20);
        Theme.styleButton(add);
        add.addActionListener(this);
        add(add);
        
        update = new JButton("Update");
        update.setBounds(320, 70, 80, 20);
        Theme.styleButton(update);
        update.addActionListener(this);
        add(update);
        
        cancel = new JButton("Cancel");
        cancel.setBounds(420, 70, 80, 20);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);
        
        setSize(900, 700);
        setLocation(300, 100);
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == search) {
            String query = "select * from teacher where rollno = '"+cEmpId.getSelectedItem()+"'";
            try {
                Conn c = new Conn();
                ResultSet rs = c.s.executeQuery(query);
                table.setModel(DbUtils.resultSetToTableModel(rs));
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else if (ae.getSource() == print) {
            try {
                table.print();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else if (ae.getSource() == add) {
            setVisible(false);
            new AddTeacher();
        } else if (ae.getSource() == update) {
            setVisible(false);
            new UpdateTeacher();
        } else {
            setVisible(false);
        }
    }

    public static void main(String[] args) {
        new TeacherDetails();
    }
}
