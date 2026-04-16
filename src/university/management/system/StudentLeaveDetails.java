package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.sql.*;
import net.proteanit.sql.DbUtils;
import java.awt.event.*;

public class StudentLeaveDetails extends JFrame implements ActionListener {

    Choice crollno;
    JTable table;
    JButton search, print, update, add, cancel;
    
    StudentLeaveDetails() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Student Leave Details");
        
        getContentPane().setBackground(Theme.DEEP_PURPLE);
        setLayout(null);
        
        JLabel heading = new JLabel("Search by Roll Number");
        heading.setBounds(20, 20, 150, 20);
        Theme.styleLabel(heading, 16, false);
        add(heading);
        
        crollno = new Choice();
        crollno.setBounds(180, 20, 150, 20);
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
        
        table = new JTable();
        table.setBackground(new Color(80, 30, 150));
        table.setForeground(Theme.TEXT);
        table.setGridColor(Theme.GOLD);
        
        try {
            Conn c = new Conn();
            ResultSet rs = c.s.executeQuery("select * from studentleave");
            table.setModel(DbUtils.resultSetToTableModel(rs));
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        JScrollPane jsp = new JScrollPane(table);
        jsp.setBounds(0, 100, 900, 600);
        jsp.setBackground(Theme.DEEP_PURPLE);
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
        
        cancel = new JButton("Cancel");
        cancel.setBounds(220, 70, 80, 20);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);
        
        setSize(900, 700);
        setLocation(300, 100);
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == search) {
            String query = "select * from studentleave where rollno = '"+crollno.getSelectedItem()+"'";
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
        } else {
            setVisible(false);
        }
    }

    public static void main(String[] args) {
        new StudentLeaveDetails();
    }
}
