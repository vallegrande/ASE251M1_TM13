package rony.yactayo.view;

import javax.swing.*;
import java.awt.*;

public class ButtonEditor extends DefaultCellEditor {
    protected JButton button;
    private String label;
    private boolean clicked;
    private int row;
    private EquipoView parent;

    public ButtonEditor(JCheckBox checkBox, String label, EquipoView parent) {
        super(checkBox);
        this.button = new JButton();
        this.button.setOpaque(true);
        this.label = label;
        this.parent = parent;

        button.addActionListener(e -> fireEditingStopped());
    }

    @Override
    public Component getTableCellEditorComponent(JTable table, Object obj, boolean selected, int row, int col) {
        this.row = row;
        button.setText(label);
        clicked = true;
        return button;
    }

    @Override
    public Object getCellEditorValue() {
        if (clicked) {
            int id = (int) parent.getTabla().getValueAt(row, 0); // ID de la fila

            if ("Editar".equals(label)) {
                parent.abrirModalEditar(id); // llama a tu método de la view
            } else if ("Eliminar".equals(label)) {
                int confirmar = JOptionPane.showConfirmDialog(parent, "¿Desea eliminar este equipo?");
                if (confirmar == JOptionPane.YES_OPTION) {
                    parent.eliminarEquipo(id); // llama al método público que agregamos
                }
            }
        }
        clicked = false;
        return label;
    }

    @Override
    public boolean stopCellEditing() {
        clicked = false;
        return super.stopCellEditing();
    }

    @Override
    protected void fireEditingStopped() {
        super.fireEditingStopped();
    }
}
