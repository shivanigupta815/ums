// package university.management.system;

// import javax.swing.*;
// import java.awt.*;

// public class Splash extends JFrame implements Runnable {
    
//     Thread t;
//     Splash () {
//         Theme.applyGlobalLookAndFeel();
//         Theme.styleFrame(this, "University Management System — Royal Violet Dusk");

//         setUndecorated(true);
//         setLayout(null);

//         JPanel dark = new JPanel() {
//             @Override
//             protected void paintComponent(Graphics g) {
//                 super.paintComponent(g);
//                 Graphics2D g2d = (Graphics2D) g;
//                 GradientPaint gp = new GradientPaint(0, 0, Theme.DEEP_PURPLE, 0, getHeight(), Theme.VIOLET);
//                 g2d.setPaint(gp);
//                 g2d.fillRect(0, 0, getWidth(), getHeight());
//             }
//         };
//         dark.setBounds(0, 0, 1000, 700);
//         dark.setLayout(null);

//         JLabel title = new JLabel("Welcome to University Management System");
//         title.setForeground(Theme.GOLD);
//         title.setFont(new Font("Segoe UI", Font.BOLD, 32));
//         title.setBounds(120, 250, 760, 50);
//         dark.add(title);

//         JProgressBar bar = new JProgressBar();
//         bar.setBounds(200, 340, 600, 25);
//         bar.setForeground(Theme.ELECTRIC_BLUE);
//         bar.setBackground(Theme.CONTROL_BG);
//         bar.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
//         dark.add(bar);

//         add(dark);

//         t = new Thread(this);
//         t.start();

//         setSize(1000, 700);
//         setLocationRelativeTo(null);
//         setVisible(true);

//         for (int i = 0; i <= 100; i++) {
//             bar.setValue(i);
//             try { Thread.sleep(40); } catch (Exception ignored) {}
//         }
        
//         int x = 1;
//         for (int i x=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 2; i <= 600; i+=4, x+=1) {
//             setLocation(600 - ((i + x)/2), 350 - (i/2));
//             setSize(i + 3*x, i + x/2);
            
//             try {
//                 Thread.sleep(10);
//             } catch (Exception e) {}
//         }        
//     }
    
//     public void run() {
//         try {
//             Thread.sleep(7000);
//             setVisible(false);

//             String webPath = System.getProperty("user.dir") + System.getProperty("file.separator") + "web" + System.getProperty("file.separator") + "index.html";
//             try {
//                 if (java.awt.Desktop.isDesktopSupported() && java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
//                     java.awt.Desktop.getDesktop().browse(new java.io.File(webPath).toURI());
//                     // If browser opens, we still keep app alive in case user wants to use swing login too.
//                     System.out.println("Web UI opened in default browser: " + webPath);
//                     return;
//                 }
//             } catch (Exception ex) {
//                 System.err.println("Unable to open web UI in browser: " + ex.getMessage());
//             }

//             // Fallback: open old Login form if web UI isn't available.
//             new Login();
//         } catch (Exception e) {
//             e.printStackTrace();
//             new Login();
//         }
//     }
    
//     public static void main(String[] args) {
//         new Splash();
//     }
// }2
package university.management.system;

import javax.swing.*;
import java.awt.*;
import java.io.File;

public class Splash extends JFrame implements Runnable {

    Thread t;
    static Process nodeProcess; // keep reference so we can kill it on exit

    Splash() {
        Theme.applyGlobalLookAndFeel();
        Theme.styleFrame(this, "University Management System — Royal Violet Dusk");

        setUndecorated(true);
        setLayout(null);

        JPanel dark = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2d = (Graphics2D) g;
                GradientPaint gp = new GradientPaint(0, 0, Theme.DEEP_PURPLE, 0, getHeight(), Theme.VIOLET);
                g2d.setPaint(gp);
                g2d.fillRect(0, 0, getWidth(), getHeight());
            }
        };
        dark.setBounds(0, 0, 1000, 700);
        dark.setLayout(null);

        JLabel title = new JLabel("Welcome to University Management System");
        title.setForeground(Theme.GOLD);
        title.setFont(new Font("Segoe UI", Font.BOLD, 32));
        title.setBounds(120, 250, 760, 50);
        dark.add(title);

        JProgressBar bar = new JProgressBar();
        bar.setBounds(200, 340, 600, 25);
        bar.setForeground(Theme.ELECTRIC_BLUE);
        bar.setBackground(Theme.CONTROL_BG);
        bar.setBorder(BorderFactory.createLineBorder(Theme.GOLD, 2));
        dark.add(bar);

        add(dark);

        // ── Start Node.js server automatically ──────────────────────────────
        startNodeServer();

        // ── Shutdown hook: kill Node when Java app exits ─────────────────────
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (nodeProcess != null && nodeProcess.isAlive()) {
                nodeProcess.destroyForcibly();
                System.out.println("Node.js server stopped.");
            }
        }));

        t = new Thread(this);
        t.start();

        setSize(1000, 700);
        setLocationRelativeTo(null);
        setVisible(true);

        for (int i = 0; i <= 100; i++) {
            bar.setValue(i);
            try { Thread.sleep(40); } catch (Exception ignored) {}
        }

        int x = 1;
        for (int i = 2; i <= 600; i += 4, x += 1) {
            setLocation(600 - ((i + x) / 2), 350 - (i / 2));
            setSize(i + 3 * x, i + x / 2);
            try { Thread.sleep(10); } catch (Exception ignored) {}
        }
    }

    // ── Starts "node server.js" from the project root ────────────────────────
    private void startNodeServer() {
        try {
            String projectDir = System.getProperty("user.dir");
            String serverPath = projectDir + File.separator + "server.js";

            // Check server.js actually exists before trying
            if (!new File(serverPath).exists()) {
                System.err.println("server.js not found at: " + serverPath);
                return;
            }

            // Windows needs "cmd /c node …", Unix just "node …"
            ProcessBuilder pb;
            String os = System.getProperty("os.name").toLowerCase();
            if (os.contains("win")) {
                pb = new ProcessBuilder("cmd", "/c", "node", serverPath);
            } else {
                pb = new ProcessBuilder("node", serverPath);
            }

            pb.directory(new File(projectDir));
            pb.redirectErrorStream(true); // merge stderr into stdout

            nodeProcess = pb.start();
            System.out.println("Node.js server started (PID: " + nodeProcess.pid() + ")");

            // Optional: print server logs to Java console
            new Thread(() -> {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(nodeProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("[Node] " + line);
                    }
                } catch (Exception ignored) {}
            }).start();

            // Give the server ~2 seconds to fully start before the browser opens
            Thread.sleep(2000);

        } catch (Exception e) {
            System.err.println("Failed to start Node.js server: " + e.getMessage());
            JOptionPane.showMessageDialog(null,
                "Could not start backend server.\n" +
                "Make sure Node.js is installed and server.js is in the project folder.\n\n" +
                "Error: " + e.getMessage(),
                "Server Start Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public void run() {
        try {
            Thread.sleep(7000);
            setVisible(false);

            String webPath = System.getProperty("user.dir") + File.separator + "web" + File.separator + "index.html";
            try {
                if (java.awt.Desktop.isDesktopSupported() &&
                        java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
                   Desktop.getDesktop().browse(new java.net.URI("https://ums-app1.onrender.com"));

                    System.out.println("Web UI opened in default browser: " + webPath);
                    return;
                }
            } catch (Exception ex) {
                System.err.println("Unable to open web UI in browser: " + ex.getMessage());
            }

            // Fallback: open old Login form if web UI isn't available.
            new Login();
        } catch (Exception e) {
            e.printStackTrace();
            new Login();
        }
    }

    public static void main(String[] args) {
        new Splash();
    }
};