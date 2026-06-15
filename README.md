# 🍔 Bijao Burger — Demo

Prueba de concepto de la plataforma de votación para el festival
Bijao Burger: fichas de participantes, votación con código de compra,
ranking en vivo y panel del organizador.

---

## Cómo montarlo en Vercel (guía paso a paso)

### Paso 1 · Sube el código a GitHub

1. Crea una cuenta en https://github.com si no tienes.
2. Crea un repositorio nuevo: botón **New** → nombre `bijao-burger` → **Create repository**.
3. Sube los archivos. Dos formas:
   - **Sin instalar nada:** en la página del repo, clic en *uploading an existing file*
     y arrastra TODO el contenido de esta carpeta (incluida la carpeta `src`).
   - **Con git** (si lo tienes instalado):
     ```bash
     cd bijao-burger
     git init
     git add .
     git commit -m "Demo Bijao Burger"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/bijao-burger.git
     git push -u origin main
     ```

### Paso 2 · Conecta Vercel

1. Entra a https://vercel.com y regístrate con tu cuenta de GitHub (botón *Continue with GitHub*).
2. Clic en **Add New… → Project**.
3. Busca el repositorio `bijao-burger` y dale **Import**.
4. Vercel detecta solo que es un proyecto Vite. No cambies nada y dale **Deploy**.
5. En 1-2 minutos tendrás una URL tipo `bijao-burger.vercel.app`. ¡Ya está en línea!

> En este punto la app funciona en **modo local**: cada visitante guarda sus
> votos solo en su propio celular (verás un aviso amarillo). Para que todos
> compartan el mismo ranking, sigue el paso 3.

### Paso 3 · Activa los votos compartidos con Supabase (gratis)

1. Entra a https://supabase.com y crea una cuenta (también con GitHub).
2. **New project** → ponle nombre `bijao-burger`, elige una contraseña y la
   región más cercana (South America / São Paulo). Espera ~2 min a que se cree.
3. En el menú lateral abre **SQL Editor → New query**, pega el contenido del
   archivo `supabase.sql` de este proyecto y dale **Run**.
4. Ve a **Project Settings → API** y copia dos valores:
   - **Project URL** (algo como `https://abcdefg.supabase.co`)
   - **anon public** key (una clave larga)
5. Vuelve a Vercel → tu proyecto → **Settings → Environment Variables** y agrega:

   | Nombre                   | Valor                      |
   |--------------------------|----------------------------|
   | `VITE_SUPABASE_URL`      | la Project URL que copiaste |
   | `VITE_SUPABASE_ANON_KEY` | la clave anon public        |

6. Ve a la pestaña **Deployments**, abre el menú `⋯` del último despliegue y
   dale **Redeploy** (necesario para que tome las variables nuevas).

Listo: el aviso amarillo desaparece y todos los visitantes ven el mismo
ranking en vivo.

### Paso 4 (opcional) · Dominio propio

En Vercel → **Settings → Domains** puedes conectar un dominio comprado
(ej. `bijaoburger.com`, ~USD $10-15/año en Namecheap o GoDaddy) o usar
gratis un subdominio `.vercel.app` personalizado.

---

## Probar en tu computador (opcional)

Requiere Node.js 18+ (https://nodejs.org):

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Para probar con Supabase en local, copia
`.env.example` como `.env.local` y pon tus claves.

---

## Estructura

```
bijao-burger/
├── index.html          # página base
├── package.json        # dependencias
├── vite.config.js      # configuración de Vite
├── supabase.sql        # script para crear la tabla de votos
├── .env.example        # plantilla de variables de entorno
└── src/
    ├── main.jsx        # punto de entrada
    ├── App.jsx         # toda la interfaz (fichas, votación, ranking, panel)
    ├── storage.js      # capa de datos: Supabase o localStorage
    └── styles.css      # fuentes, animaciones y utilidades
```

## Qué le falta para ser producto real (siguiente fase)

- Validar códigos de compra contra ventas reales de cada local.
- Validación de celular por SMS o WhatsApp (hoy solo se verifica el formato).
- Proteger la escritura de votos en el servidor (hoy la clave pública permite
  escribir directo: suficiente para demo, no para el evento real).
- Panel del organizador con acceso por contraseña.
- Fotos reales de las hamburguesas y datos de los locales participantes.
