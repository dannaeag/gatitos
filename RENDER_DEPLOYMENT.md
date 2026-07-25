# 🚀 Guía de Despliegue en Render (Render.com)

Este proyecto está 100% preparado para ser desplegado automáticamente en **Render** utilizando el archivo de Blueprint [`render.yaml`](file:///Users/diegomartinez/Desktop/app%20de%20llevar%20registro%20de%20plata/render.yaml).

---

## 🛠️ Servicios que se crearán en Render:
1. **Web Service (`radiant-volta-api`)**: Servidor API REST en Node.js/Express.
2. **PostgreSQL Database (`radiant-volta-db`)**: Base de datos gestionada PostgreSQL.

---

## 📋 Pasos para Desplegar:

### Paso 1: Subir cambios a GitHub
Asegúrate de haber hecho push del repositorio a tu GitHub:
```bash
git push -u origin main
```

### Paso 2: Crear Blueprint en Render
1. Inicia sesión en [Render.com](https://dashboard.render.com).
2. Haz clic en **New +** (arriba a la derecha) y selecciona **Blueprint**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio `dannaeag/gatitos`.
4. Render detectará automáticamente el archivo `render.yaml`.
5. Revisa los nombres de los servicios y haz clic en **Apply**.

### Paso 3: ¡Listo!
Render creará automáticamente:
- La base de datos PostgreSQL en la nube.
- Ejecutará `prisma db push` para crear las tablas (`Category`, `Transaction`, `Budget`).
- Sembrará automáticamente las 14 categorías por defecto al iniciar.
- Te entregará la URL pública de tu API (ejemplo: `https://radiant-volta-api.onrender.com/api`).

### Paso 4: Conectar la App Móvil/Web
En la app, dirígete a la pestaña **Ajustes ⚙️** -> **Conexión con Backend (Render)** e ingresa tu URL pública de Render.
