import express from 'express';
import session from 'express-session';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

declare module 'express-session' {
  interface SessionData {
    user?: { name: string; email: string };
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(session({
    secret: 'prototype-lms-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Routes principales
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Prototype LMS - Newsletter vers Formation',
        user: req.session?.user
    });
});

app.get('/module', (req, res) => {
    res.render('module/index', {
        title: 'Newsletter vers Formation Interactive', 
        user: req.session?.user || { name: 'Visiteur Demo', email: 'demo@test.com' }
    });
});

app.get('/lesson/:id', (req, res) => {
    const lessons = [
        { id: 1, title: 'Introduction : Pourquoi Transformer ?', duration: 5 },
        { id: 2, title: 'Methode ADDIE Appliquee', duration: 15 },
        { id: 3, title: 'Transformation Pratique', duration: 20 },
        { id: 4, title: 'Validation et Certification', duration: 5 }
    ];
    
    const lessonId = parseInt(req.params.id);
    const lesson = lessons.find(l => l.id === lessonId);
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    
    if (!lesson) {
        return res.status(404).send('Lecon non trouvee');
    }
    
    res.render('lesson/detail', {
        title: lesson.title,
        user: req.session?.user || { name: 'Visiteur Demo', email: 'demo@test.com' },
        lesson,
        lessons,
        currentIndex,
        nextLesson: lessons[currentIndex + 1],
        prevLesson: lessons[currentIndex - 1],
        progress: Math.round(((currentIndex + 1) / lessons.length) * 100)
    });
});

app.get('/module/success', (req, res) => {
    res.render('module/final', {
        title: 'Formation Complétée',
        user: req.session?.user || { name: 'Visiteur Demo', email: 'demo@test.com' }
    });
});

app.get('/certificat-image', async (req, res) => {
  const user = req.session?.user || { name: 'Visiteur Demo', email: 'demo@test.com' };

  registerFont(path.join(__dirname, '../fonts/opensans-regular.ttf'), { family: 'OpenSans' });

  const width = 1200;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fond pastel
  ctx.fillStyle = '#fdf6e3';
  ctx.fillRect(0, 0, width, height);

  // Texte
  ctx.font = 'bold 40px OpenSans';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('🎓 Certificat de Formation', width / 2, 100);
  ctx.font = '28px OpenSans';
  ctx.fillText(`Décerné à : ${user.name}`, width / 2, 200);
  ctx.font = '22px OpenSans';
  ctx.fillText(`Email : ${user.email}`, width / 2, 250);
  ctx.fillText(`Date : ${new Date().toLocaleDateString('fr-FR')}`, width / 2, 300);
  ctx.fillText('Signature : ______________________', width / 2, 400);

  // Générer le buffer PNG
  const buffer = canvas.toBuffer('image/png');

  // Envoyer l’image
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `inline; filename="certificat-${user.name.replace(/\s+/g, '_')}.png"`);
  res.send(buffer);
});

// Auth rapide pour demo
app.post('/auth/demo', (req, res) => {
    if (req.session) {
        req.session.user = { name: 'La Démo', email: 'demo@test.com' };
    }
    res.redirect('/module');
});

app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => res.redirect('/'));
    } else {
        res.redirect('/');
    }
});

console.log('Prototype LMS demarre sur http://localhost:' + PORT);
app.listen(PORT);
