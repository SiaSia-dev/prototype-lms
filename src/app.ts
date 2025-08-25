import express from 'express';
import session from 'express-session';
import PDFDocument from 'pdfkit';
import fs from 'fs';
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

app.get('/certificat', (req, res) => {
  const user = req.session?.user || { name: 'Visiteur Demo', email: 'demo@test.com' };

  // Préparer les polices
  const emojiFontPath = path.join(__dirname, '../fonts/static/NotoEmoji-Regular.ttf');
  const regularFontPath = path.join(__dirname, '../fonts/OpenSans-Regular.ttf');
  const filename = `certificat-${user.name.replace(/\s+/g, '_')}.pdf`;

  // Définir les headers AVANT de pipe
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    res.on('finish', () => {
    console.log('Réponse envoyée avec succès');
    });

    console.log('Headers sent:', res.headersSent);



  const doc = new PDFDocument();
  doc.pipe(res);

  // Polices
  doc.registerFont('emoji', emojiFontPath);
  doc.registerFont('regular', regularFontPath);

  // Contenu du certificat
  doc.font('emoji').fontSize(24).text('', { align: 'center' });
  doc.font('regular').fontSize(24).text('Certificat de Formation', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Ce certificat est décerné à :`, { align: 'center' });
  doc.fontSize(20).text(user.name, { align: 'center', underline: true });
  doc.moveDown();
  doc.fontSize(14).text(`Email : ${user.email}`, { align: 'center' });
  doc.moveDown();
  doc.text(`Module complété avec succès le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
  doc.moveDown(2);
  doc.text('Signature : ______________________', { align: 'center' });

  doc.end();
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
