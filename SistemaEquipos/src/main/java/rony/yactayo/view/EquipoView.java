package rony.yactayo.view;

import rony.yactayo.model.Equipo;
import rony.yactayo.service.EquipoDAO;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class EquipoView extends JFrame {

    private JTable tabla;
    private DefaultTableModel modelo;
    private JButton btnRefrescar, btnRegistrar;
    private EquipoDAO equipoDAO;

    public EquipoView() {
        equipoDAO = new EquipoDAO();
        initComponents();
        cargarTabla();
        setTitle("Sistema de Registro de Equipos");
        setSize(1200, 600);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setVisible(true);
    }

    private void initComponents() {
        // Modelo con columnas "Editar" y "Eliminar"
        modelo = new DefaultTableModel(new Object[]{
                "ID", "Código", "Tipo", "Marca", "Modelo",
                "Sistema Operativo", "RAM", "Almacenamiento",
                "Fecha Registro", "Fecha Mantenimiento", "Estado",
                "Editar", "Eliminar"
        }, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return column == 11 || column == 12; // Solo botones editables
            }
        };

        tabla = new JTable(modelo);
        tabla.setRowHeight(30);
        JScrollPane scroll = new JScrollPane(tabla);

        // Renderers y Editors de botones
        tabla.getColumn("Editar").setCellRenderer(new ButtonRenderer(Color.GREEN));
        tabla.getColumn("Eliminar").setCellRenderer(new ButtonRenderer(Color.RED));
        tabla.getColumn("Editar").setCellEditor(new ButtonEditor(new JCheckBox(), "Editar", this));
        tabla.getColumn("Eliminar").setCellEditor(new ButtonEditor(new JCheckBox(), "Eliminar", this));

        btnRegistrar = new JButton("Registrar");
        btnRegistrar.setBackground(new Color(0, 153, 51));
        btnRegistrar.setForeground(Color.WHITE);

        btnRefrescar = new JButton("Refrescar");
        btnRefrescar.setBackground(new Color(0, 102, 204));
        btnRefrescar.setForeground(Color.WHITE);

        JPanel panelBotones = new JPanel();
        panelBotones.add(btnRegistrar);
        panelBotones.add(btnRefrescar);

        add(scroll, BorderLayout.CENTER);
        add(panelBotones, BorderLayout.SOUTH);

        // Eventos
        btnRegistrar.addActionListener(e -> abrirModalAgregar());
        btnRefrescar.addActionListener(e -> cargarTabla());
    }

    public void cargarTabla() {
        modelo.setRowCount(0);
        DateTimeFormatter formatoUsuario = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            List<Equipo> lista = equipoDAO.listar();
            for (Equipo e : lista) {
                String fechaRegistro = "";
                if (e.getFechaRegistro() != null && !e.getFechaRegistro().isEmpty()) {
                    String soloFecha = e.getFechaRegistro().split(" ")[0];
                    fechaRegistro = LocalDate.parse(soloFecha).format(formatoUsuario);
                }

                String fechaMantenimiento = "";
                if (e.getFechaMantenimiento() != null && !e.getFechaMantenimiento().isEmpty()) {
                    String soloFecha = e.getFechaMantenimiento().split(" ")[0];
                    fechaMantenimiento = LocalDate.parse(soloFecha).format(formatoUsuario);
                }

                modelo.addRow(new Object[]{
                        e.getId(),
                        e.getCodigo(),
                        e.getTipo(),
                        e.getMarca(),
                        e.getModelo(),
                        e.getSistemaOperativo(),
                        e.getRam(),
                        e.getAlmacenamiento(),
                        fechaRegistro,
                        fechaMantenimiento,
                        e.getEstado(),
                        "Editar",
                        "Eliminar"
                });
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error al cargar tabla: " + ex.getMessage());
        }
    }

    private void abrirModalAgregar() {
        JTextField campoCodigo = new JTextField();
        JComboBox<String> campoTipo = new JComboBox<>(new String[]{"Laptop","PC","Impresora","Router"});
        JTextField campoMarca = new JTextField();
        JTextField campoModelo = new JTextField();
        JComboBox<String> campoSO = new JComboBox<>(new String[]{"Windows","Linux","MacOS"});
        JComboBox<String> campoRAM = new JComboBox<>(new String[]{"4GB","8GB","16GB","32GB"});
        JComboBox<String> campoAlmacenamiento = new JComboBox<>(new String[]{"128GB","256GB","512GB","1TB"});
        JTextField campoFechaRegistro = new JTextField();
        JTextField campoFechaMantenimiento = new JTextField();
        JComboBox<String> campoEstado = new JComboBox<>(new String[]{"Operativo","Inactivo","Mantenimiento"});

        Object[] campos = {
                "Código:", campoCodigo,
                "Tipo:", campoTipo,
                "Marca:", campoMarca,
                "Modelo:", campoModelo,
                "Sistema Operativo:", campoSO,
                "RAM:", campoRAM,
                "Almacenamiento:", campoAlmacenamiento,
                "Fecha Registro (dd/MM/yyyy):", campoFechaRegistro,
                "Fecha Mantenimiento (dd/MM/yyyy):", campoFechaMantenimiento,
                "Estado:", campoEstado
        };

        int opcion = JOptionPane.showConfirmDialog(this, campos, "Agregar Equipo", JOptionPane.OK_CANCEL_OPTION);
        if (opcion == JOptionPane.OK_OPTION) {
            try {
                DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                String fechaRegBD = LocalDate.parse(campoFechaRegistro.getText(), formato).toString();
                String fechaManBD = LocalDate.parse(campoFechaMantenimiento.getText(), formato).toString();

                Equipo e = new Equipo(
                        0,
                        campoCodigo.getText(),
                        (String) campoTipo.getSelectedItem(),
                        campoMarca.getText(),
                        campoModelo.getText(),
                        (String) campoSO.getSelectedItem(),
                        (String) campoRAM.getSelectedItem(),
                        (String) campoAlmacenamiento.getSelectedItem(),
                        fechaManBD,
                        (String) campoEstado.getSelectedItem(),
                        fechaRegBD
                );

                equipoDAO.insertar(e);
                cargarTabla();
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error en los datos: " + ex.getMessage());
            }
        }
    }


    public void abrirModalEditar(int id) {
        try {
            Equipo e = equipoDAO.obtenerPorId(id);
            if (e == null) return;

            JTextField campoCodigo = new JTextField(e.getCodigo());
            JComboBox<String> campoTipo = new JComboBox<>(new String[]{"Laptop","PC","Impresora","Router"});
            campoTipo.setSelectedItem(e.getTipo());

            JTextField campoMarca = new JTextField(e.getMarca());
            JTextField campoModelo = new JTextField(e.getModelo());

            JComboBox<String> campoSO = new JComboBox<>(new String[]{"Windows","Linux","MacOS"});
            campoSO.setSelectedItem(e.getSistemaOperativo());

            JComboBox<String> campoRAM = new JComboBox<>(new String[]{"4GB","8GB","16GB","32GB"});
            campoRAM.setSelectedItem(e.getRam());

            JComboBox<String> campoAlmacenamiento = new JComboBox<>(new String[]{"128GB","256GB","512GB","1TB"});
            campoAlmacenamiento.setSelectedItem(e.getAlmacenamiento());

            DateTimeFormatter formatoUsuario = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            JTextField campoFechaRegistro;
            if (e.getFechaRegistro() != null && !e.getFechaRegistro().isEmpty()) {
                String soloFecha = e.getFechaRegistro().split(" ")[0];
                campoFechaRegistro = new JTextField(LocalDate.parse(soloFecha).format(formatoUsuario));
            } else {
                campoFechaRegistro = new JTextField("");
            }

            JTextField campoFechaMantenimiento;
            if (e.getFechaMantenimiento() != null && !e.getFechaMantenimiento().isEmpty()) {
                String soloFecha = e.getFechaMantenimiento().split(" ")[0];
                campoFechaMantenimiento = new JTextField(LocalDate.parse(soloFecha).format(formatoUsuario));
            } else {
                campoFechaMantenimiento = new JTextField("");
            }

            JComboBox<String> campoEstado = new JComboBox<>(new String[]{"Operativo","Inactivo","Mantenimiento"});
            campoEstado.setSelectedItem(e.getEstado());

            Object[] campos = {
                    "Código:", campoCodigo,
                    "Tipo:", campoTipo,
                    "Marca:", campoMarca,
                    "Modelo:", campoModelo,
                    "Sistema Operativo:", campoSO,
                    "RAM:", campoRAM,
                    "Almacenamiento:", campoAlmacenamiento,
                    "Fecha Registro (dd/MM/yyyy):", campoFechaRegistro,
                    "Fecha Mantenimiento (dd/MM/yyyy):", campoFechaMantenimiento,
                    "Estado:", campoEstado
            };

            int opcion = JOptionPane.showConfirmDialog(this, campos, "Editar Equipo", JOptionPane.OK_CANCEL_OPTION);
            if (opcion == JOptionPane.OK_OPTION) {
                DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                String fechaRegBD = LocalDate.parse(campoFechaRegistro.getText(), formato).toString();
                String fechaManBD = LocalDate.parse(campoFechaMantenimiento.getText(), formato).toString();

                e.setCodigo(campoCodigo.getText());
                e.setTipo((String) campoTipo.getSelectedItem());
                e.setMarca(campoMarca.getText());
                e.setModelo(campoModelo.getText());
                e.setSistemaOperativo((String) campoSO.getSelectedItem());
                e.setRam((String) campoRAM.getSelectedItem());
                e.setAlmacenamiento((String) campoAlmacenamiento.getSelectedItem());
                e.setFechaRegistro(fechaRegBD);
                e.setFechaMantenimiento(fechaManBD);
                e.setEstado((String) campoEstado.getSelectedItem());

                equipoDAO.actualizar(e);
                cargarTabla();
            }

        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Error al editar: " + ex.getMessage());
        }
    }


    public void eliminarEquipo(int id) {
        int confirmar = JOptionPane.showConfirmDialog(this, "¿Desea eliminar este equipo?");
        if (confirmar == JOptionPane.YES_OPTION) {
            try {
                equipoDAO.eliminar(id);
                cargarTabla();
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error al eliminar: " + ex.getMessage());
            }
        }
    }


    public JTable getTabla() {
        return tabla;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(EquipoView::new);
    }
}
