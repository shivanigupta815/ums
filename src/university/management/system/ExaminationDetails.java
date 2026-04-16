package university.management.system;

import java.awt.*;
import javax.swing.*;
import java.sql.*;
import net.proteanit.sql.DbUtils;
import java.awt.event.*;

public class ExaminationDetails extends JFrame implements ActionListener {

    JTextField search;
    JButton submit, cancel;
    JTable table;
    
    ExaminationDetails() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Examination Results");
        
        setSize(1000, 475);
        setLocation(300, 100);
        setLayout(null);
        
        JLabel heading = new JLabel("Check Result");
        heading.setBounds(80, 15, 400, 50);
        Theme.styleLabel(heading, 24, true);
        add(heading);
        
        search = new JTextField();
        search.setBounds(80, 90, 200, 30);
        search.setFont(new Font("Segoe UI", Font.PLAIN, 18));
        search.setBackground(new Color(80, 30, 150));
        search.setForeground(Theme.TEXT);
        search.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(search);
        
        submit = new JButton("Result");
        submit.setBounds(300, 90, 120, 30);
        Theme.styleButton(submit);
        submit.addActionListener(this);
        add(submit);
        
        cancel = new JButton("Back");
        cancel.setBounds(440, 90, 120, 30);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        add(cancel);
        
        table = new JTable();
        table.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        table.setBackground(new Color(80, 30, 150));
        table.setForeground(Theme.TEXT);
        table.setGridColor(Theme.GOLD);
        
        JScrollPane jsp = new JScrollPane(table);
        jsp.setBounds(0, 130, 1000, 310);
        jsp.setBackground(Theme.PANEL_BG);
        add(jsp);
        
        try {
             Conn c = new Conn();
             ResultSet rs = c.s.executeQuery("select * from student");
             table.setModel(DbUtils.resultSetToTableModel(rs));
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        table.addMouseListener(new MouseAdapter() {
            public void mouseClicked(MouseEvent me) {
                int row = table.getSelectedRow();
                search.setText(table.getModel().getValueAt(row, 2).toString());
            }
        });
        
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == submit) {
            setVisible(false);    
            new Marks(search.getText());
        } else {
            setVisible(false);
        }
    }

    public static void main(String[] args) {
        new ExaminationDetails();
    }
}
