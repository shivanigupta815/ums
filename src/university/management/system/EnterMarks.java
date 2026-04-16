package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.sql.*;
import java.awt.event.*;

public class EnterMarks extends JFrame implements ActionListener {

    Choice crollno;
    JComboBox cbsemester;
    JTextField tfsub1, tfsub2,tfsub3,tfsub4,tfsub5,tfmarks1,tfmarks2,tfmarks3,tfmarks4,tfmarks5;
    JButton cancel, submit;
    
    EnterMarks() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Enter Student Marks");
        
        setSize(1000, 500);
        setLocation(300, 150);
        setLayout(null);
        
        ImageIcon i1 = new ImageIcon(ClassLoader.getSystemResource("icons/exam.jpg"));
        Image i2 = i1.getImage().getScaledInstance(400, 300, Image.SCALE_DEFAULT);
        ImageIcon i3 = new ImageIcon(i2);
        JLabel image = new JLabel(i3);
        image.setBounds(500, 40, 400, 300);
        add(image);
        
        JLabel heading = new JLabel("Enter Marks of Student");
        heading.setBounds(50, 0, 500, 50);
        Theme.styleLabel(heading, 20, true);
        add(heading);
        
        JLabel lblrollnumber = new JLabel("Select Roll Number");
        lblrollnumber.setBounds(50, 70, 150, 20);
        Theme.styleLabel(lblrollnumber, 14, false);
        add(lblrollnumber);
        
        crollno = new Choice();
        crollno.setBounds(200, 70, 150, 20);
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
        
        JLabel lblsemester = new JLabel("Select Semester");
        lblsemester.setBounds(50, 110, 150, 20);
        Theme.styleLabel(lblsemester, 14, false);
        add(lblsemester);
        
        String semester[] = {"1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester" };
        cbsemester = new JComboBox(semester);
        cbsemester.setBounds(200, 110, 150, 20);
        cbsemester.setBackground(new Color(80, 30, 150));
        cbsemester.setForeground(Theme.TEXT);
        add(cbsemester);
        
        JLabel lblentersubject = new JLabel("Enter Subject");
        lblentersubject.setBounds(100, 150, 200, 40);
        Theme.styleLabel(lblentersubject, 14, false);
        add(lblentersubject);
        
        JLabel lblentermarks = new JLabel("Enter Marks");
        lblentermarks.setBounds(320, 150, 200, 40);
        Theme.styleLabel(lblentermarks, 14, false);
        add(lblentermarks);
        
        tfsub1 = new JTextField();
        tfsub1.setBounds(50, 200, 200, 20);
        tfsub1.setBackground(new Color(80, 30, 150));
        tfsub1.setForeground(Theme.TEXT);
        tfsub1.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfsub1);
        
        tfsub2 = new JTextField();
        tfsub2.setBounds(50, 230, 200, 20);
        tfsub2.setBackground(new Color(80, 30, 150));
        tfsub2.setForeground(Theme.TEXT);
        tfsub2.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfsub2);
        
        tfsub3 = new JTextField();
        tfsub3.setBounds(50, 260, 200, 20);
        tfsub3.setBackground(new Color(80, 30, 150));
        tfsub3.setForeground(Theme.TEXT);
        tfsub3.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfsub3);
        
        tfsub4 = new JTextField();
        tfsub4.setBounds(50, 290, 200, 20);
        tfsub4.setBackground(new Color(80, 30, 150));
        tfsub4.setForeground(Theme.TEXT);
        tfsub4.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfsub4);
        
        tfsub5 = new JTextField();
        tfsub5.setBounds(50, 320, 200, 20);
        tfsub5.setBackground(new Color(80, 30, 150));
        tfsub5.setForeground(Theme.TEXT);
        tfsub5.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfsub5);
        
        tfmarks1 = new JTextField();
        tfmarks1.setBounds(250, 200, 200, 20);
        tfmarks1.setBackground(new Color(80, 30, 150));
        tfmarks1.setForeground(Theme.TEXT);
        tfmarks1.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfmarks1);
        
        tfmarks2 = new JTextField();
        tfmarks2.setBounds(250, 230, 200, 20);
        tfmarks2.setBackground(new Color(80, 30, 150));
        tfmarks2.setForeground(Theme.TEXT);
        tfmarks2.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfmarks2);
        
        tfmarks3 = new JTextField();
        tfmarks3.setBounds(250, 260, 200, 20);
        tfmarks3.setBackground(new Color(80, 30, 150));
        tfmarks3.setForeground(Theme.TEXT);
        tfmarks3.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfmarks3);
        
        tfmarks4 = new JTextField();
        tfmarks4.setBounds(250, 290, 200, 20);
        tfmarks4.setBackground(new Color(80, 30, 150));
        tfmarks4.setForeground(Theme.TEXT);
        tfmarks4.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfmarks4);
        
        tfmarks5 = new JTextField();
        tfmarks5.setBounds(250, 320, 200, 20);
        tfmarks5.setBackground(new Color(80, 30, 150));
        tfmarks5.setForeground(Theme.TEXT);
        tfmarks5.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfmarks5);
        
        submit = new JButton("Submit");
        submit.setBounds(70, 360, 150, 25);
        Theme.styleButton(submit);
        submit.addActionListener(this);
        add(submit);
        
        cancel = new JButton("Back");
        cancel.setBounds(280, 360, 150, 25);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);
        
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == submit) {
            try {
                Conn c = new Conn();
                
                String query1 = "insert into subject values('"+crollno.getSelectedItem()+"', '"+cbsemester.getSelectedItem()+"', '"+tfsub1.getText()+"', '"+tfsub2.getText()+"', '"+tfsub3.getText()+"', '"+tfsub4.getText()+"', '"+tfsub5.getText()+"')";
                String query2 = "insert into marks values('"+crollno.getSelectedItem()+"', '"+cbsemester.getSelectedItem()+"', '"+tfmarks1.getText()+"', '"+tfmarks2.getText()+"', '"+tfmarks3.getText()+"', '"+tfmarks4.getText()+"', '"+tfmarks5.getText()+"')";
            
                c.s.executeUpdate(query1);
                c.s.executeUpdate(query2);
                
                JOptionPane.showMessageDialog(null, "Marks Inserted Sucessfully");
                setVisible(false);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            setVisible(false);
        }
    }

    public static void main(String[] args) {
        new EnterMarks();
    }
}
