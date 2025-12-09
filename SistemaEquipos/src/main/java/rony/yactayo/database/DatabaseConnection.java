package rony.yactayo.database;

import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseConnection {

    private static final String URL = "jdbc:mysql://rony-formulario.cpo2i6842kw2.us-east-1.rds.amazonaws.com:3306/equipos_db";
    private static final String USER = "admin";
    private static final String PASS = "rony2025";

    public static Connection getConnection() {
        try {
            return DriverManager.getConnection(URL, USER, PASS);
        } catch (Exception e) {
            System.out.println("Error en la conexión: " + e.getMessage());
            return null;
        }
    }
}
