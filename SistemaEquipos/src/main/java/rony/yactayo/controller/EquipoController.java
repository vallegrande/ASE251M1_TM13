package rony.yactayo.controller;

import rony.yactayo.model.Equipo;
import rony.yactayo.service.EquipoDAO;

import java.util.List;

public class EquipoController {

    private EquipoDAO dao = new EquipoDAO();

    public void add(Equipo e) throws Exception {
        dao.insertar(e);
    }

    public void update(Equipo e) throws Exception {
        dao.actualizar(e);
    }

    public void delete(int id) throws Exception {
        dao.eliminar(id);
    }

    public List<Equipo> listar() throws Exception {
        return dao.listar();
    }

    public boolean existeCodigo(String codigo) throws Exception {
        List<Equipo> lista = dao.listar();
        for (Equipo e : lista) {
            if (e.getCodigo().equalsIgnoreCase(codigo)) {
                return true;
            }
        }
        return false;
    }

    public Equipo obtenerEquipoPorId(int id) throws Exception {
        return dao.obtenerPorId(id);
    }
}
