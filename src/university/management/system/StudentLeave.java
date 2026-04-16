package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.sql.*;
import com.toedter.calendar.JDateChooser;
import java.awt.event.*;

public class StudentLeave extends JFrame implements ActionListener {

    Choice crollno, ctime;
    JDateChooser dcdate;
    JButton submit, cancel;
    
    StudentLeave() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Apply Leave (Student)");
        
        setSize(500, 550);
        setLocation(550, 100);
        setLayout(null);
        
        getContentPane().setBackground(Theme.DEEP_PURPLE);
        
        JLabel heading = new JLabel("Apply Leave (Student)");
        heading.setBounds(40, 50, 300, 30);
        Theme.styleLabel(heading, 20, true);
        add(heading);
        
        JLabel lblrollno = new JLabel("Search by Roll Number");
        lblrollno.setBounds(60, 100, 200, 20);
        Theme.styleLabel(lblrollno, 18, false);
        add(lblrollno);
        
        crollno = new Choice();
        crollno.setBounds(60, 130, 200, 20);
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
        
        JLabel lbldate = new JLabel("Date");
        lbldate.setBounds(60, 180, 200, 20);
        Theme.styleLabel(lbldate, 18, false);
        add(lbldate);
        
        dcdate = new JDateChooser();
        dcdate.setBounds(60, 210, 200, 25);
        dcdate.setBackground(new Color(80, 30, 150));
        dcdate.setForeground(Theme.TEXT);
        add(dcdate);
        
        JLabel lbltime = new JLabel("Time Duration");
        lbltime.setBounds(60, 260, 200, 20);
        Theme.styleLabel(lbltime, 18, false);
        add(lbltime);
        
        ctime = new Choice();
        ctime.setBounds(60, 290, 200, 20);
        ctime.setBackground(new Color(80, 30, 150));
        ctime.setForeground(Theme.TEXT);
        ctime.add("Full Day");
        ctime.add("Half Day");
        add(ctime);
        
        submit = new JButton("Submit");
        submit.setBounds(60, 350, 100, 25);
        Theme.styleButton(submit);
        submit.addActionListener(this);
        add(submit);
        
        cancel = new JButton("Cancel");
        cancel.setBounds(200, 350, 100, 25);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);
        
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == submit) {
            String rollno = crollno.getSelectedItem();
            String date = ((JTextField) dcdate.getDateEditor().getUiComponent()).getText();
            String duration = ctime.getSelectedItem();
            
            String query = "insert into studentleave values('"+rollno+"', '"+date+"', '"+duration+"')";
            
            try {
                Conn c = new Conn();
                c.s.executeUpdate(query);
                JOptionPane.showMessageDialog(null, "Leave Confirmed");
                setVisible(false);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            setVisible(false);
        }
    }

    public static void main(String[] args) {
        new StudentLeave();
    }
}
