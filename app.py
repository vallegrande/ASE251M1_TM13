from flask import Flask, render_template, request, redirect, url_for, flash
app = Flask(__name__)
app.secret_key = 'supersecretkey'

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        if not email or not password:
            error = "Todos los campos son obligatorios."
        elif len(password) < 6:
            error = "La contraseña debe tener al menos 6 caracteres."
        elif email != "admin@demo.com" or password != "123456":
            error = "Email o contraseña incorrectos."
        else:
            flash("Inicio de sesión exitoso.", "success")
            return redirect(url_for("home"))
    return render_template("login.html", error=error)

@app.route("/register", methods=["GET", "POST"])
def register():
    error = None
    if request.method == "POST":
        nombre = request.form.get("nombre")
        apellido = request.form.get("apellido")
        email = request.form.get("email")
        password = request.form.get("password")
        if not nombre or not apellido or not email or not password:
            error = "Todos los campos son obligatorios."
        elif len(password) < 6:
            error = "La contraseña debe tener al menos 6 caracteres."
        else:
            flash("Registro exitoso.", "success")
            return redirect(url_for("login"))
    return render_template("register.html", error=error)

@app.route("/admission", methods=["GET", "POST"])
def admission():
    error = None
    if request.method == "POST":
        nombre_nino = request.form.get("nombre_nino")
        edad = request.form.get("edad")
        nombre_padre = request.form.get("nombre_padre")
        telefono = request.form.get("telefono")
        email = request.form.get("email")
        if not nombre_nino or not edad or not nombre_padre or not telefono or not email:
            error = "Todos los campos son obligatorios."
        elif int(edad) < 1 or int(edad) > 6:
            error = "La edad debe estar entre 1 y 6 años."
        elif len(telefono) < 9:
            error = "El teléfono debe tener al menos 9 dígitos."
        else:
            flash("Solicitud de admisión enviada correctamente.", "success")
            return redirect(url_for("admission"))
    return render_template("admission.html", error=error)

@app.route("/inicio")
def inicio():
    return render_template("inicio.html")

@app.route("/colegio")
def colegio():
    return render_template("colegio.html")

@app.route("/programas")
def programas():
    return render_template("programas.html")

@app.route("/agenda")
def agenda():
    return render_template("agenda.html")

@app.route("/galeria")
def galeria():
    return render_template("galeria.html")

@app.route("/noticias")
def noticias():
    return render_template("noticias.html")

@app.route("/producto")
def producto():
    return render_template("producto.html")

@app.route("/contacto")
def contacto():
    return render_template("contacto.html")

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, render_template, request, redirect, url_for, flash
app = Flask(__name__)
app.secret_key = 'supersecretkey'

@app.route("/")
def home():
    
    return render_template("index.html")
@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        if not email or not password:
            error = "Todos los campos son obligatorios."
        elif len(password) < 6:
            error = "La contraseña debe tener al menos 6 caracteres."
        elif email != "admin@demo.com" or password != "123456":
            error = "Email o contraseña incorrectos."
        else:
            flash("Inicio de sesión exitoso.", "success")
            return redirect(url_for("home"))
    return render_template("login.html", error=error)

@app.route("/register", methods=["GET", "POST"])
def register():
    error = None
    if request.method == "POST":
        nombre = request.form.get("nombre")
        apellido = request.form.get("apellido")
        email = request.form.get("email")
        password = request.form.get("password")
        if not nombre or not apellido or not email or not password:
            error = "Todos los campos son obligatorios."
        elif len(password) < 6:
            error = "La contraseña debe tener al menos 6 caracteres."
        else:
            flash("Registro exitoso.", "success")
            return redirect(url_for("login"))
    return render_template("register.html", error=error)

if __name__ == "__main__":
    app.run(debug=True)