package university.management.system;

import java.sql.*;

public class Conn {
    Connection c;
    Statement s;

    public Conn() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            c = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/universitymanagementsystem?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                "root",
                "Shivani@1808"
            );

            s = c.createStatement();
            System.out.println("Database Connected ✅");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
