package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.util.*;
import com.toedter.calendar.JDateChooser;
import java.awt.event.*;

public class AddTeacher extends JFrame implements ActionListener{
    
    JTextField tfname, tffname, tfaddress, tfphone, tfemail, tfx, tfxii, tfaadhar;
    JLabel labelempId;
    JDateChooser dcdob;
    JComboBox cbcourse, cbbranch;
    JButton submit, cancel;
    
    Random ran = new Random();
    long first4 = Math.abs((ran.nextLong() % 9000L) + 1000L);
    
    AddTeacher() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Add New Teacher");
        
        setSize(900, 700);
        setLocation(350, 50);
        
        setLayout(null);
        
        JLabel heading = new JLabel("New Teacher Details");
        heading.setBounds(310, 30, 500, 50);
        Theme.styleLabel(heading, 30, true);
        add(heading);
        
        JLabel lblname = new JLabel("Name");
        lblname.setBounds(50, 150, 100, 30);
        Theme.styleLabel(lblname, 20, true);
        add(lblname);
        
        tfname = new JTextField();
        tfname.setBounds(200, 150, 150, 30);
        tfname.setBackground(new Color(80, 30, 150));
        tfname.setForeground(Theme.TEXT);
        tfname.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfname);
        
        JLabel lblfname = new JLabel("Father's Name");
        lblfname.setBounds(400, 150, 200, 30);
        Theme.styleLabel(lblfname, 20, true);
        add(lblfname);
        
        tffname = new JTextField();
        tffname.setBounds(600, 150, 150, 30);
        tffname.setBackground(new Color(80, 30, 150));
        tffname.setForeground(Theme.TEXT);
        tffname.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tffname);
        
        JLabel lblempId = new JLabel("Employee Id");
        lblempId.setBounds(50, 200, 200, 30);
        Theme.styleLabel(lblempId, 20, true);
        add(lblempId);
        
        labelempId = new JLabel("101"+first4);
        labelempId.setBounds(200, 200, 200, 30);
        Theme.styleLabel(labelempId, 20, true);
        add(labelempId);
        
        JLabel lbldob = new JLabel("Date of Birth");
        lbldob.setBounds(400, 200, 200, 30);
        Theme.styleLabel(lbldob, 20, true);
        add(lbldob);
        
        dcdob = new JDateChooser();
        dcdob.setBounds(600, 200, 150, 30);
        add(dcdob);
        
        JLabel lbladdress = new JLabel("Address");
        lbladdress.setBounds(50, 250, 200, 30);
        Theme.styleLabel(lbladdress, 20, true);
        add(lbladdress);
        
        tfaddress = new JTextField();
        tfaddress.setBounds(200, 250, 150, 30);
        tfaddress.setBackground(new Color(80, 30, 150));
        tfaddress.setForeground(Theme.TEXT);
        tfaddress.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfaddress);
        
        JLabel lblphone = new JLabel("Phone");
        lblphone.setBounds(400, 250, 200, 30);
        Theme.styleLabel(lblphone, 20, true);
        add(lblphone);
        
        tfphone = new JTextField();
        tfphone.setBounds(600, 250, 150, 30);
        tfphone.setBackground(new Color(80, 30, 150));
        tfphone.setForeground(Theme.TEXT);
        tfphone.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfphone);
        
        JLabel lblemail = new JLabel("Email Id");
        lblemail.setBounds(50, 300, 200, 30);
        Theme.styleLabel(lblemail, 20, true);
        add(lblemail);
        
        tfemail = new JTextField();
        tfemail.setBounds(200, 300, 150, 30);
        tfemail.setBackground(new Color(80, 30, 150));
        tfemail.setForeground(Theme.TEXT);
        tfemail.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfemail);
        
        JLabel lblx = new JLabel("Class X (%)");
        lblx.setBounds(400, 300, 200, 30);
        Theme.styleLabel(lblx, 20, true);
        add(lblx);
        
        tfx = new JTextField();
        tfx.setBounds(600, 300, 150, 30);
        tfx.setBackground(new Color(80, 30, 150));
        tfx.setForeground(Theme.TEXT);
        tfx.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfx);
        
        JLabel lblxii = new JLabel("Class XII (%)");
        lblxii.setBounds(50, 350, 200, 30);
        Theme.styleLabel(lblxii, 20, true);
        add(lblxii);
        
        tfxii = new JTextField();
        tfxii.setBounds(200, 350, 150, 30);
        tfxii.setBackground(new Color(80, 30, 150));
        tfxii.setForeground(Theme.TEXT);
        tfxii.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfxii);
        
        JLabel lblaadhar = new JLabel("Aadhar Number");
        lblaadhar.setBounds(400, 350, 200, 30);
        Theme.styleLabel(lblaadhar, 20, true);
        add(lblaadhar);
        
        tfaadhar = new JTextField();
        tfaadhar.setBounds(600, 350, 150, 30);
        tfaadhar.setBackground(new Color(80, 30, 150));
        tfaadhar.setForeground(Theme.TEXT);
        tfaadhar.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfaadhar);
        
        JLabel lblcourse = new JLabel("Qualification");
        lblcourse.setBounds(50, 400, 200, 30);
        Theme.styleLabel(lblcourse, 20, true);
        add(lblcourse);
        
        String course[] = {"B.Tech", "BBA", "BCA", "Bsc", "Msc", "MBA", "MCA", "MCom", "MA", "BA"};
        cbcourse = new JComboBox(course);
        cbcourse.setBounds(200, 400, 150, 30);
        cbcourse.setBackground(new Color(80, 30, 150));
        cbcourse.setForeground(Theme.TEXT);
        add(cbcourse);
        
        JLabel lblbranch = new JLabel("Department");
        lblbranch.setBounds(400, 400, 200, 30);
        Theme.styleLabel(lblbranch, 20, true);
        add(lblbranch);
        
        String branch[] = {"Computer Science", "Electronics", "Mechanical", "Civil", "IT"};
        cbbranch = new JComboBox(branch);
        cbbranch.setBounds(600, 400, 150, 30);
        cbbranch.setBackground(new Color(80, 30, 150));
        cbbranch.setForeground(Theme.TEXT);
        add(cbbranch);
        
        submit = new JButton("Submit");
        submit.setBounds(250, 550, 120, 30);
        Theme.styleButton(submit);
        submit.addActionListener(this);
        add(submit);
        
        cancel = new JButton("Cancel");
        cancel.setBounds(450, 550, 120, 30);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);
        
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == submit) {
            String name = tfname.getText();
            String fname = tffname.getText();
            String rollno = labelempId.getText();
            String dob = ((JTextField) dcdob.getDateEditor().getUiComponent()).getText();
            String address = tfaddress.getText();
            String phone = tfphone.getText();
            String email = tfemail.getText();
            String x = tfx.getText();
            String xii = tfxii.getText();
            String aadhar = tfaadhar.getText();
            String course = (String) cbcourse.getSelectedItem();
            String branch = (String) cbbranch.getSelectedItem();
            
            try {
                String query = "insert into teacher values('"+name+"', '"+fname+"', '"+rollno+"', '"+dob+"', '"+address+"', '"+phone+"', '"+email+"', '"+x+"', '"+xii+"', '"+aadhar+"', '"+course+"', '"+branch+"')";

                Conn con = new Conn();
                con.s.executeUpdate(query);
                
                JOptionPane.showMessageDialog(null, "Teacher Details Inserted Successfully");
                setVisible(false);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            setVisible(false);
        }
    }
    
    public static void main(String[] args) {
        new AddTeacher();
    }
}
