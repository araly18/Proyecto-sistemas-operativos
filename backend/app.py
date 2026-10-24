from flask import Flask, jsonify, request
from flask_cors import CORS
from motor import Motor, hilos_so, ps_hilos

app = Flask(__name__)
CORS(app, origins=[
    'https://proyecto-sistemas-operativos-aybi.onrender.com',
    'http://localhost:3000',
])

motor = None


@app.post('/api/iniciar')
def iniciar():
    """Cuerpo JSON opcional: {"forzado": true} o {"sin_proteccion": true}."""
    global motor
    if motor:
        motor.detener()
    datos = request.get_json(silent=True) or {}
    motor = Motor(forzado=bool(datos.get('forzado', False)),
                  sin_proteccion=bool(datos.get('sin_proteccion', False)))
    motor.iniciar()
    return jsonify(ok=True)


@app.post('/api/detener')
def detener():
    if motor:
        motor.detener()
    return jsonify(ok=True)


@app.get('/api/estado')
def estado():
    base = motor.estado() if motor else {'activo': False}
    base['hilos_so'] = hilos_so()   # hilos reales del proceso del servidor
    return jsonify(base)


@app.get('/api/ps')
def ps():
    """Salida real de ps -eLf del proceso del servidor (evidencia de hilos del SO)."""
    return jsonify(ps_hilos())


if __name__ == '__main__':
    app.run(port=5000, threaded=True)