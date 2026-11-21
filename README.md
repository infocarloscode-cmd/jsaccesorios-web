# Accesorios Johaysi Salazar · Tienda online

Catálogo con carrito para una marca de accesorios de Venezuela. El cliente arma su pedido y lo envía con un clic al WhatsApp de la tienda, sin pasarela de pago. La dueña carga, edita y borra sus productos desde un panel propio.

**Stack:** React 19, Vite, Tailwind CSS v4, React Router, Supabase (base de datos, autenticación y almacenamiento de fotos).

## Qué tiene

- Catálogo por categorías, con búsqueda y galería de fotos por producto.
- Carrito que arma el mensaje del pedido y abre WhatsApp con el resumen.
- Horario de atención configurable.
- Panel `/admin` con inicio de sesión:
  - productos (crear, editar, borrar, subir fotos);
  - categorías nuevas desde el mismo formulario;
  - número de WhatsApp y horario;
  - cuentas de usuario del panel (usuario y contraseña, sin correo).

## Seguridad

- Las tablas usan Row Level Security: cualquiera puede leer el catálogo, pero solo una sesión iniciada puede modificarlo.
- Las funciones que gestionan cuentas (`supabase_usuarios.sql`) no se pueden llamar sin sesión.
- El registro público está desactivado en Supabase: las cuentas solo se crean desde el panel.

## Cómo correrlo

```bash
npm install
cp .env.example .env   # completar con la URL y la clave pública de tu proyecto Supabase
npm run dev
```

En el SQL Editor de Supabase, ejecutar en orden `supabase_setup.sql` y `supabase_usuarios.sql`.

## Autor

Hecho por **Carlos Gómez** ([Carloscode_](https://github.com/infocarloscode-cmd)) para Accesorios Johaysi Salazar, que autorizó publicar el código.
