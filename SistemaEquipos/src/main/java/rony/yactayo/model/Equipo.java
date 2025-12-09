package rony.yactayo.model;

public class Equipo {
    private int id;
    private String codigo;
    private String tipo;
    private String marca;
    private String modelo;
    private String sistemaOperativo;
    private String ram;
    private String almacenamiento;
    private String fechaMantenimiento; // ISO: "yyyy-MM-dd"
    private String estado;
    private String fechaRegistro; // ISO: "yyyy-MM-dd"

    // Constructor completo
    public Equipo(int id, String codigo, String tipo, String marca, String modelo,
                  String sistemaOperativo, String ram, String almacenamiento,
                  String fechaMantenimiento, String estado, String fechaRegistro) {
        this.id = id;
        this.codigo = codigo;
        this.tipo = tipo;
        this.marca = marca;
        this.modelo = modelo;
        this.sistemaOperativo = sistemaOperativo;
        this.ram = ram;
        this.almacenamiento = almacenamiento;
        this.fechaMantenimiento = fechaMantenimiento;
        this.estado = estado;
        this.fechaRegistro = fechaRegistro;
    }

    // Getters y setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getSistemaOperativo() { return sistemaOperativo; }
    public void setSistemaOperativo(String sistemaOperativo) { this.sistemaOperativo = sistemaOperativo; }

    public String getRam() { return ram; }
    public void setRam(String ram) { this.ram = ram; }

    public String getAlmacenamiento() { return almacenamiento; }
    public void setAlmacenamiento(String almacenamiento) { this.almacenamiento = almacenamiento; }

    public String getFechaMantenimiento() { return fechaMantenimiento; }
    public void setFechaMantenimiento(String fechaMantenimiento) { this.fechaMantenimiento = fechaMantenimiento; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
