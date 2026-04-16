package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class Project extends JFrame implements ActionListener {

    private JMenuItem createMenuItem(String text) {
        JMenuItem item = new JMenuItem(text);
        Theme.styleMenuItem(item);
        item.addActionListener(this);
        return item;
    }

    Project() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Dashboard — University Management System");
        setSize(1540, 850);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        ImageIcon i1 = new ImageIcon(ClassLoader.getSystemResource("icons/third.jpg"));
        Image i2 = i1.getImage().getScaledInstance(1500, 750, Image.SCALE_DEFAULT);
        ImageIcon i3 = new ImageIcon(i2);
        JLabel image = new JLabel(i3);
        add(image);
        
        JMenuBar mb = new JMenuBar();
        Theme.styleMenuBar(mb);
        
        // New Information
        JMenu newInformation = new JMenu("New Information");
        Theme.styleMenu(newInformation);
        mb.add(newInformation);
        
        JMenuItem facultyInfo = new JMenuItem("New Faculty Information");
        Theme.styleMenuItem(facultyInfo);
        facultyInfo.addActionListener(this);
        newInformation.add(facultyInfo);
        
        JMenuItem studentInfo = createMenuItem("New Student Information");
        newInformation.add(studentInfo);
        
        // Details
        JMenu details = new JMenu("View Details");
        Theme.styleMenu(details);
        mb.add(details);
        
        JMenuItem facultydetails = createMenuItem("View Faculty Details");
        details.add(facultydetails);
        
        JMenuItem studentdetails = createMenuItem("View Student Details");
        details.add(studentdetails);
        
        // Leave
        JMenu leave = new JMenu("Apply Leave");
        Theme.styleMenu(leave);
        mb.add(leave);
        
        JMenuItem facultyleave = createMenuItem("Faculty Leave");
        leave.add(facultyleave);
        
        JMenuItem studentleave = createMenuItem("Student Leave");
        leave.add(studentleave);
        
        // Leave Details
        JMenu leaveDetails = new JMenu("Leave Details");
        Theme.styleMenu(leaveDetails);
        mb.add(leaveDetails);
        
        JMenuItem facultyleavedetails = createMenuItem("Faculty Leave Details");
        leaveDetails.add(facultyleavedetails);
        
        JMenuItem studentleavedetails = createMenuItem("Student Leave Details");
        leaveDetails.add(studentleavedetails);
        
        // Exams
        JMenu exam = new JMenu("Examination");
        Theme.styleMenu(exam);
        mb.add(exam);
        
        JMenuItem examinationdetails = createMenuItem("Examination Results");
        exam.add(examinationdetails);
        
        JMenuItem entermarks = createMenuItem("Enter Marks");
        exam.add(entermarks);
        
        // UpdateInfo
        JMenu updateInfo = new JMenu("Update Details");
        Theme.styleMenu(updateInfo);
        mb.add(updateInfo);
        
        JMenuItem updatefacultyinfo = createMenuItem("Update Faculty Details");
        updateInfo.add(updatefacultyinfo);
        
        JMenuItem updatestudentinfo = createMenuItem("Update Student Details");
        updateInfo.add(updatestudentinfo);
        
        // fee
        JMenu fee = new JMenu("Fee Details");
        Theme.styleMenu(fee);
        mb.add(fee);
        
        JMenuItem feestructure = createMenuItem("Fee Structure");
        fee.add(feestructure);
        
        JMenuItem feeform = createMenuItem("Student Fee Form");
        fee.add(feeform);
        
        // Utility
        JMenu utility = new JMenu("Utility");
        Theme.styleMenu(utility);
        mb.add(utility);
        
        JMenuItem notepad = createMenuItem("Notepad");
        utility.add(notepad);
        
        JMenuItem calc = createMenuItem("Calculator");
        utility.add(calc);
        
        // about
        JMenu about = new JMenu("About");
        Theme.styleMenu(about);
        mb.add(about);
        
        JMenuItem ab = createMenuItem("About");
        about.add(ab);
        
        // exit
        JMenu exit = new JMenu("Exit");
        exit.setForeground(Color.RED);
        mb.add(exit);
        
        JMenuItem ex = createMenuItem("Exit");
        exit.add(ex);
        
        setJMenuBar(mb);
        
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        String msg = ae.getActionCommand();
        
        if (msg.equals("Exit")) {
            setVisible(false);
        } else if (msg.equals("Calculator")) {
            try {
                Runtime.getRuntime().exec("calc.exe");
            } catch (Exception e) {
                
            }
        } else if (msg.equals("Notepad")) {
            try {
                Runtime.getRuntime().exec("notepad.exe");
            } catch (Exception e) {
                
            }
        } else if (msg.equals("New Faculty Information")) {
            new AddTeacher();
        } else if (msg.equals("New Student Information")) {
            new AddStudent();
        } else if (msg.equals("View Faculty Details")) {
            new TeacherDetails();
        } else if (msg.equals("View Student Details")) {
            new StudentDetails();
        } else if (msg.equals("Faculty Leave")) {
            new TeacherLeave();
        } else if (msg.equals("Student Leave")) {
            new StudentLeave();
        } else if (msg.equals("Faculty Leave Details")) {
            new TeacherLeaveDetails();
        } else if (msg.equals("Student Leave Details")) {
            new StudentLeaveDetails();
        } else if (msg.equals("Update Faculty Details")) {
            new UpdateTeacher();
        } else if (msg.equals("Update Student Details")) {
            new UpdateStudent();
        } else if (msg.equals("Enter Marks")) {
            new EnterMarks();
        } else if (msg.equals("Examination Results")) {
            new ExaminationDetails();
        } else if (msg.equals("Fee Structure")) {
            new FeeStructure();
        } else if (msg.equals("About")) {
            new About();
        } else if (msg.equals("Student Fee Form")) {
            new StudentFeeForm();
        }
    }

    public static void main(String[] args) {
        new Project();
    }
}
