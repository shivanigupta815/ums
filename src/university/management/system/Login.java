package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;

public class Login extends JFrame implements ActionListener{

    JButton login, cancel;
    JTextField tfusername, tfpassword;
    
    Login () {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "Login — Teacher Leave Management System");

        setLayout(null);
        
        JLabel lblusername = new JLabel("Username");
        lblusername.setBounds(40, 20, 100, 25);
        Theme.styleLabel(lblusername, 16, true);
        add(lblusername);
        
        tfusername = new JTextField();
        tfusername.setBounds(150, 20, 150, 25);
        tfusername.setBackground(new Color(80, 30, 150));
        tfusername.setForeground(Theme.TEXT);
        tfusername.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfusername);
        
        JLabel lblpassword = new JLabel("Password");
        lblpassword.setBounds(40, 70, 100, 25);
        Theme.styleLabel(lblpassword, 16, true);
        add(lblpassword);
        
        tfpassword = new JPasswordField();
        tfpassword.setBounds(150, 70, 150, 25);
        tfpassword.setBackground(new Color(80, 30, 150));
        tfpassword.setForeground(Theme.TEXT);
        tfpassword.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        add(tfpassword);
        
        login = new JButton("Login");
        login.setBounds(40, 140, 120, 30);
        Theme.styleButton(login);
        login.addActionListener(this);
        
        cancel = new JButton("Cancel");
        cancel.setBounds(180, 140, 120, 30);
        Theme.styleButton(cancel);
        cancel.addActionListener(this);
        
        add(login);
        add(cancel);
        
        ImageIcon i1 = new ImageIcon(ClassLoader.getSystemResource("icons/second.jpg"));
        Image i2 = i1.getImage().getScaledInstance(200, 200, Image.SCALE_DEFAULT);
        ImageIcon i3 = new ImageIcon(i2);
        JLabel image = new JLabel(i3);
        image.setBounds(350, 0, 200, 200);
        add(image);
        
        setSize(600, 300);
        setLocation(500, 250);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }
    
    public void actionPerformed(ActionEvent ae) {
        if (ae.getSource() == login) {
            String username = tfusername.getText().trim();
            String password = tfpassword.getText().trim();
            
            if (username.isEmpty() || password.isEmpty()) {
                JOptionPane.showMessageDialog(this, "Please enter both username and password.", "Missing credentials", JOptionPane.WARNING_MESSAGE);
                return;
            }

            String query = "select * from login where username='" + username + "' and password='" + password + "'";
            
            try {
                Conn c = new Conn();
                if (c == null || c.s == null) {
                    throw new SQLException("Database connection failed");
                }

                ResultSet rs = c.s.executeQuery(query);
                
                if (rs.next()) {
                    setVisible(false);
                } else {
                    JOptionPane.showMessageDialog(this, "Invalid username or password", "Login failed", JOptionPane.ERROR_MESSAGE);
                    // keep login window open for retry
                }
                
            } catch (SQLException e) {
                JOptionPane.showMessageDialog(this, "Database error: " + e.getMessage() + "\nUsing local fallback login for admin/admin.", "Database Error", JOptionPane.ERROR_MESSAGE);
                e.printStackTrace();

                if ("admin".equals(username) && "admin".equals(password)) {
                    setVisible(false);
                }
            } catch (Exception e) {
                JOptionPane.showMessageDialog(this, "Unexpected error: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                e.printStackTrace();

                if ("admin".equals(username) && "admin".equals(password)) {
                    setVisible(false);
                }
            }
        } else if (ae.getSource() == cancel) {
            setVisible(false);
            dispose();
        }
    }

    public static void main(String[] args) {
        new Login();
    }
}
