package university.management.system;

import javax.swing.*;
import java.awt.*;

public class Theme {
    public static final Color DEEP_PURPLE = new Color(48, 15, 95);
    public static final Color VIOLET = new Color(122, 46, 178);
    public static final Color MAGENTA = new Color(207, 56, 165);
    public static final Color GOLD = new Color(232, 189, 58);
    public static final Color ELECTRIC_BLUE = new Color(85, 178, 255);
    public static final Color PANEL_BG = new Color(25, 8, 48);
    public static final Color CONTROL_BG = new Color(58, 23, 123);
    public static final Color TEXT = Color.WHITE;

    public static void applyGlobalLookAndFeel() {
        UIManager.put("Panel.background", PANEL_BG);
        UIManager.put("Button.background", CONTROL_BG);
        UIManager.put("Button.foreground", TEXT);
        UIManager.put("Label.foreground", TEXT);
        UIManager.put("TextField.background", new Color(72, 28, 153));
        UIManager.put("TextField.foreground", TEXT);
        UIManager.put("TextField.caretForeground", TEXT);
        UIManager.put("PasswordField.background", new Color(72, 28, 153));
        UIManager.put("PasswordField.foreground", TEXT);
        UIManager.put("ComboBox.background", new Color(72, 28, 153));
        UIManager.put("ComboBox.foreground", TEXT);
        UIManager.put("OptionPane.background", PANEL_BG);
        UIManager.put("Panel.background", PANEL_BG);
        UIManager.put("TabbedPane.background", PANEL_BG);
        UIManager.put("MenuBar.background", new Color(37, 14, 69));
        UIManager.put("Menu.background", new Color(37, 14, 69));
        UIManager.put("MenuItem.background", new Color(50, 20, 90));
        UIManager.put("Menu.foreground", GOLD);
        UIManager.put("MenuItem.foreground", TEXT);
    }

    public static void styleFrame(JFrame frame, String title) {
        frame.setTitle(title);
        frame.getContentPane().setBackground(PANEL_BG);
        frame.getContentPane().setForeground(TEXT);
        frame.setFont(new Font("Segoe UI", Font.PLAIN, 14));
    }

    public static void styleLabel(JLabel label, int fontSize, boolean bold) {
        label.setForeground(TEXT);
        label.setFont(new Font("Segoe UI", bold ? Font.BOLD : Font.PLAIN, fontSize));
    }

    public static void styleButton(JButton button) {
        button.setBackground(CONTROL_BG);
        button.setForeground(TEXT);
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createLineBorder(GOLD, 2));
        button.setFont(new Font("Segoe UI", Font.BOLD, 14));
    }

    public static void styleMenuBar(JMenuBar mb) {
        mb.setBackground(new Color(37, 14, 69));
        mb.setForeground(GOLD);
        mb.setBorder(BorderFactory.createMatteBorder(0, 0, 2, 0, MAGENTA));
    }

    public static void styleMenu(JMenu menu) {
        menu.setForeground(GOLD);
        menu.setBackground(new Color(42, 17, 72));
        menu.setFont(new Font("Segoe UI", Font.BOLD, 14));
    }

    public static void styleMenuItem(JMenuItem item) {
        item.setForeground(TEXT);
        item.setBackground(new Color(55, 21, 88));
        item.setFont(new Font("Segoe UI", Font.PLAIN, 13));
    }
}
