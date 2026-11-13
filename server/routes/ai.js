const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');

// --- 🔬 SPOR BİLİMİ VERİTABANI ---
// 1.0 = Ana Kas (%100 Etki)
// 0.5 = Yardımcı Kas (%50 Etki)
// 0.2 = Stabilizör (%20 Etki)

const EXERCISE_RULES = [
  // --- GÖĞÜS HAREKETLERİ ---
  { 
    keywords: ['flat bench', 'barbell bench', 'dumbbell press', 'chest press'], 
    targets: { chest: 1.0, triceps: 0.4, shoulders: 0.3 } // Klasik Bench: Göğüs, Arka Kol, Ön Omuz
  },
  { 
    keywords: ['incline'], // Eğimli Sehpa
    targets: { chest: 0.8, shoulders: 0.6, triceps: 0.4 } // Üst göğüs ve ön omuz daha aktif
  },
  { 
    keywords: ['decline'], // Aşağı Eğimli
    targets: { chest: 0.9, triceps: 0.5, shoulders: 0.1 } // Alt göğüs, omuz devre dışı
  },
  { 
    keywords: ['push-up', 'push up', 'şınav'], 
    targets: { chest: 0.8, triceps: 0.6, shoulders: 0.4, abs: 0.3 } // Şınav karın da sıkar
  },
  { 
    keywords: ['fly', 'butterfly', 'crossover', 'pec deck'], 
    targets: { chest: 1.0, shoulders: 0.2 } // İzole göğüs, az miktar omuz
  },
  { 
    keywords: ['dips'], 
    targets: { triceps: 0.8, chest: 0.7, shoulders: 0.4 } // Öne eğilmeye göre değişir ama genelde ortaktır
  },

  // --- SIRT HAREKETLERİ ---
  { 
    keywords: ['pull-up', 'pull up', 'barfiks', 'lat pulldown'], 
    targets: { back: 1.0, biceps: 0.3, shoulders: 0.2 } // Kanat odaklı
  },
  { 
    keywords: ['chin-up', 'chin up'], 
    targets: { back: 0.8, biceps: 0.8 } // Avuç içi dönükse biceps çok çalışır
  },
  { 
    keywords: ['row', 'çekiş', 'dumbell row', 'barbell row', 't-bar'], 
    targets: { back: 1.0, biceps: 0.4, shoulders: 0.3 } // Kalınlık odaklı
  },
  { 
    keywords: ['deadlift'], 
    targets: { back: 0.7, legs: 0.8, abs: 0.4, shoulders: 0.2 } // Hem sırt hem bacak hem merkez!
  },
  { 
    keywords: ['face pull'], 
    targets: { shoulders: 0.9, back: 0.5 } // Arka omuz ve sırt (Traps)
  },
  { 
    keywords: ['shrug', 'traps'], 
    targets: { back: 0.6, shoulders: 0.4 } // Trapezler
  },

  // --- BACAK HAREKETLERİ ---
  { 
    keywords: ['squat', 'çökme'], 
    targets: { legs: 1.0, abs: 0.3, back: 0.2 } // Kral hareket
  },
  { 
    keywords: ['leg press'], 
    targets: { legs: 1.0 } // İzole bacak
  },
  { 
    keywords: ['lunge', 'split squat', 'bulgarian'], 
    targets: { legs: 1.0, abs: 0.2 } // Denge gerektirdiği için az karın
  },
  { 
    keywords: ['extension', 'curl', 'calf'], 
    targets: { legs: 1.0 } // Tam izole
  },
  { 
    keywords: ['rdl', 'stiff leg', 'good morning'], 
    targets: { legs: 0.8, back: 0.6 } // Arka bacak ve bel
  },

  // --- OMUZ HAREKETLERİ ---
  { 
    keywords: ['overhead', 'military', 'shoulder press', 'arnold'], 
    targets: { shoulders: 1.0, triceps: 0.4 } // Presler arka kolu yorar
  },
  { 
    keywords: ['lateral', 'raise', 'upright'], 
    targets: { shoulders: 1.0, back: 0.2 } // Yana açış trapezleri de gıdıklar
  },
  { 
    keywords: ['front raise'], 
    targets: { shoulders: 1.0, chest: 0.2 } // Ön omuz bazen üst göğüsle karışır
  },

  // --- KOL HAREKETLERİ ---
  { 
    keywords: ['curl', 'biceps', 'pazu', 'hammer'], 
    targets: { biceps: 1.0, shoulders: 0.1 } // Hammer ön kolu da vurur ama biceps sayıyoruz
  },
  { 
    keywords: ['triceps', 'pushdown', 'skull', 'kickback', 'rope'], 
    targets: { triceps: 1.0, abs: 0.1 } // Pushdown yaparken karın sıkılır
  },
  { 
    keywords: ['close grip'], 
    targets: { triceps: 0.9, chest: 0.5, shoulders: 0.3 } // Dar tutuş bench
  },

  // --- KARIN & KARDİYO ---
  { 
    keywords: ['plank'], 
    targets: { abs: 1.0, shoulders: 0.4, legs: 0.2 } // Plank omuzları yakar
  },
  { 
    keywords: ['crunch', 'mekik', 'sit-up', 'leg raise', 'russian'], 
    targets: { abs: 1.0 } 
  },
  { 
    keywords: ['run', 'koşu', 'cycling', 'jump', 'burpee'], 
    targets: { legs: 0.6, abs: 0.3, shoulders: 0.2 } // Tüm vücut kondisyon
  }
];

// Eşleşme olmazsa kullanılacak basit kelimeler
const FALLBACK_KEYWORDS = {
  chest: ['göğüs', 'pec'],
  back: ['sırt', 'lat', 'kanat'],
  legs: ['bacak', 'ayak'],
  shoulders: ['omuz', 'deltoid'],
  biceps: ['kol', 'ön kol'],
  triceps: ['arka kol'],
  abs: ['karın', 'mide', 'core']
};

const POINTS_PER_SET = 5; // Her setin verdiği baz puan

// @route   GET api/ai/analyze-body
router.get('/analyze-body', auth, async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const workouts = await WorkoutSession.find({ 
      user: req.user.id,
      date: { $gte: oneMonthAgo }
    });

    // Puan Tablosu
    let scores = { chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, abs: 0, legs: 0 };

    if (workouts.length === 0) return res.json(scores);

    workouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        const name = ex.name.toLowerCase();
        const setVolume = ex.sets.length; 
        let matched = false;

        // 1. ADIM: Detaylı Bilimsel Kuralları Tara
        for (const rule of EXERCISE_RULES) {
          if (rule.keywords.some(k => name.includes(k))) {
            
            // Eşleşme bulundu! Puanları dağıt
            Object.keys(rule.targets).forEach(muscle => {
              const multiplier = rule.targets[muscle];
              
              // Süre bazlı hareketler (Plank, Koşu) için özel hesap
              if (ex.type === 'duration') {
                 const totalSeconds = ex.sets.reduce((acc, s) => acc + (s.duration || 0), 0);
                 // Her 10 saniye = 1 Set gibi etki etsin
                 scores[muscle] += (totalSeconds / 10) * multiplier; 
              } 
              // Vücut Ağırlığı ve Normal Ağırlık için
              else {
                 scores[muscle] += setVolume * POINTS_PER_SET * multiplier;
              }
            });
            
            matched = true;
            break; // İlk ve en doğru kuralı bulduysan dur.
          }
        }

        // 2. ADIM: Kural yoksa basit kelime araması yap
        if (!matched) {
          Object.keys(FALLBACK_KEYWORDS).forEach(muscle => {
            if (FALLBACK_KEYWORDS[muscle].some(k => name.includes(k))) {
               scores[muscle] += setVolume * POINTS_PER_SET;
            }
          });
        }

      });
    });

    // 100 Puan Sınırı (Renklendirme patlamasın diye)
    Object.keys(scores).forEach(key => {
      if (scores[key] > 100) scores[key] = 100;
      scores[key] = Math.round(scores[key]);
    });

    console.log("🧬 Bilimsel Analiz Tamamlandı:", scores);
    res.json(scores);

  } catch (err) {
    console.error("Analiz Hatası:", err);
    res.json({ chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, abs: 0, legs: 0 });
  }
});

module.exports = router;