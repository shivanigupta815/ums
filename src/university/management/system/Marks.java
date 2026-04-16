package university.management.system;

import java.awt.*;
import javax.swing.*;
import java.sql.*;
import java.awt.event.*;

public class Marks extends JFrame implements ActionListener {
    
    String rollno;
    JButton cancel;
    
    Marks(String rollno) {
        this.rollno = rollno;
        
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Examination Results");
        
        setSize(500, 600);
        setLocation(500, 100);
        setLayout(null);
        
        getContentPane().setBackground(Theme.DEEP_PURPLE);
        
        JLabel heading = new JLabel("Delhi Technical University");
        heading.setBounds(100, 10, 500, 25);
        Theme.styleLabel(heading, 20, true);
        add(heading);
        
        JLabel subheading = new JLabel("Result of Examination 2022");
        subheading.setBounds(100, 50, 500, 20);
        Theme.styleLabel(subheading, 18, true);
        add(subheading);
        
        JLabel lblrollno = new JLabel("Roll Number " + rollno);
        lblrollno.setBounds(60, 100, 500, 20);
        Theme.styleLabel(lblrollno, 18, false);
        add(lblrollno);
        
        JLabel lblsemester = new JLabel();
        lblsemester.setBounds(60, 130, 500, 20);
        Theme.styleLabel(lblsemester, 18, false);
        add(lblsemester);
        
        JLabel sub1 = new JLabel();
        sub1.setBounds(100, 200, 500, 20);
        Theme.styleLabel(sub1, 18, false);
        add(sub1);
        
        JLabel sub2 = new JLabel();
        sub2.setBounds(100, 230, 500, 20);
        Theme.styleLabel(sub2, 18, false);
        add(sub2);
        
        JLabel sub3 = new JLabel();
        sub3.setBounds(100, 260, 500, 20);
        Theme.styleLabel(sub3, 18, false);
        add(sub3);
        
        JLabel sub4 = new JLabel();
        sub4.setBounds(100, 290, 500, 20);
        Theme.styleLabel(sub4, 18, false);
        add(sub4);
        
        JLabel sub5 = new JLabel();
        sub5.setBounds(100, 320, 500, 20);
        Theme.styleLabel(sub5, 18, false);
        add(sub5);
        
        try {
            Conn c = new Conn();
            
            ResultSet rs1 = c.s.executeQuery("select * from subject where rollno = '"+rollno+"'");
            while(rs1.next()) {
                sub1.setText(rs1.getString("subject1"));
                sub2.setText(rs1.getString("subject2"));
                sub3.setText(rs1.getString("subject3"));
                sub4.setText(rs1.getString("subject4"));
                sub5.setText(rs1.getString("subject5"));
            }
            
            ResultSet rs2 = c.s.executeQuery("select * from marks where rollno = '"+rollno+"'");
            while(rs2.next()) {
                sub1.setText(sub1.getText() + "------------" + rs2.getString("marks1"));
                sub2.setText(sub2.getText() + "------------" + rs2.getString("marks2"));
                sub3.setText(sub3.getText() + "------------" + rs2.getString("marks3"));
                sub4.setText(sub4.getText() + "------------" + rs2.getString("marks4"));
                sub5.setText(sub5.getText() + "------------" + rs2.getString("marks5"));
                lblsemester.setText("Semester " + rs2.getString("semester"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        cancel = new JButton("Back");
        cancel.setBounds(250, 500, 120, 25);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);
        
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        setVisible(false);
    }
    
    public static void main(String[] args) {
        new Marks("");
    }
}
