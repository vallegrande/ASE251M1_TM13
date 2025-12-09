package rony.yactayo.service;

import rony.yactayo.model.Equipo;
import rony.yactayo.database.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EquipoDAO {

    // Insertar un nuevo equipo
    public void insertar(Equipo e) throws SQLException {
        String sql = "INSERT INTO equipos (codigo, tipo_equipo, marca, modelo, sistema_operativo, ram, almacenamiento, fecha_mantenimiento, estado, fecha_registro) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection cn = DatabaseConnection.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, e.getCodigo());
            ps.setString(2, e.getTipo());
            ps.setString(3, e.getMarca());
            ps.setString(4, e.getModelo());
            ps.setString(5, e.getSistemaOperativo());
            ps.setString(6, e.getRam());
            ps.setString(7, e.getAlmacenamiento());
            ps.setString(8, e.getFechaMantenimiento());
            ps.setString(9, e.getEstado());
            ps.setString(10, e.getFechaRegistro());

            ps.executeUpdate();
        }
    }

    // Actualizar un equipo existente
    public void actualizar(Equipo e) throws SQLException {
        String sql = "UPDATE equipos SET codigo=?, tipo_equipo=?, marca=?, modelo=?, sistema_operativo=?, ram=?, almacenamiento=?, fecha_mantenimiento=?, estado=?, fecha_registro=? WHERE id=?";
        try (Connection cn = DatabaseConnection.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, e.getCodigo());
            ps.setString(2, e.getTipo());
            ps.setString(3, e.getMarca());
            ps.setString(4, e.getModelo());
            ps.setString(5, e.getSistemaOperativo());
            ps.setString(6, e.getRam());
            ps.setString(7, e.getAlmacenamiento());
            ps.setString(8, e.getFechaMantenimiento());
            ps.setString(9, e.getEstado());
            ps.setString(10, e.getFechaRegistro());
            ps.setInt(11, e.getId());

            ps.executeUpdate();
        }
    }

    // Eliminar un equipo por ID
    public void eliminar(int id) throws SQLException {
        String sql = "DELETE FROM equipos WHERE id=?";
        try (Connection cn = DatabaseConnection.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    // Listar todos los equipos
    public List<Equipo> listar() throws SQLException {
        List<Equipo> lista = new ArrayList<>();
        String sql = "SELECT * FROM equipos";
        try (Connection cn = DatabaseConnection.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Equipo e = new Equipo(
                        rs.getInt("id"),
                        rs.getString("codigo"),
                        rs.getString("tipo_equipo"),
                        rs.getString("marca"),
                        rs.getString("modelo"),
                        rs.getString("sistema_operativo"),
                        rs.getString("ram"),
                        rs.getString("almacenamiento"),
                        rs.getString("fecha_mantenimiento"),
                        rs.getString("estado"),
                        rs.getString("fecha_registro")
                );
                lista.add(e);
            }
        }
        return lista;
    }

    // Obtener un equipo por su ID
    public Equipo obtenerPorId(int id) throws SQLException {
        String sql = "SELECT * FROM equipos WHERE id=?";
        try (Connection cn = DatabaseConnection.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Equipo(
                            rs.getInt("id"),
                            rs.getString("codigo"),
                            rs.getString("tipo_equipo"),
                            rs.getString("marca"),
                            rs.getString("modelo"),
                            rs.getString("sistema_operativo"),
                            rs.getString("ram"),
                            rs.getString("almacenamiento"),
                            rs.getString("fecha_mantenimiento"),
                            rs.getString("estado"),
                            rs.getString("fecha_registro")
                    );
                }
            }
        }
        return null;
    }
}
