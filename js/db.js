/* ═══════════════════════════════════════════════════════════════
   db.js — Local Database System (JSON + localStorage)
   ─────────────────────────────────────────────────────────────
   Provides a proper data layer for GitHub Pages deployment.
   Stores: views, likes, XP, achievements, quiz scores, streaks.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DB_PREFIX = 'il_';
  var DB_VERSION = 2;

  /* ── Core Storage Interface ──────────────────────────────── */
  var DB = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(DB_PREFIX + key);
        if (raw === null) return fallback !== undefined ? fallback : null;
        return JSON.parse(raw);
      } catch (e) {
        return fallback !== undefined ? fallback : null;
      }
    },

    set: function (key, value) {
      try {
        localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },

    remove: function (key) {
      try { localStorage.removeItem(DB_PREFIX + key); } catch (e) {}
    },

    /* Get all keys with prefix */
    keys: function () {
      var result = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf(DB_PREFIX) === 0) {
            result.push(k.substring(DB_PREFIX.length));
          }
        }
      } catch (e) {}
      return result;
    }
  };

  /* ══════════════════════════════════════════════════════════
     USER PROFILE
  ══════════════════════════════════════════════════════════ */
  var UserProfile = {
    get: function () {
      return DB.get('profile', {
        name: 'Elev',
        level: 1,
        xp: 0,
        streak: 0,
        lastVisit: null,
        achievements: [],
        completedChapters: [],
        quizScores: {},
        totalTimeSpent: 0,
        createdAt: new Date().toISOString()
      });
    },

    save: function (profile) {
      DB.set('profile', profile);
      DB.set('total_xp', profile.xp);
      if (window.InfoComponents) window.InfoComponents.updateXP();
    },

    addXP: function (amount, reason) {
      var p = this.get();
      p.xp += amount;
      var oldLevel = p.level;
      p.level = Math.floor(p.xp / 100) + 1;
      this.save(p);

      /* Log XP gain */
      var log = DB.get('xp_log', []);
      log.push({ amount: amount, reason: reason, date: new Date().toISOString() });
      if (log.length > 100) log = log.slice(-100);
      DB.set('xp_log', log);

      /* Level up notification */
      if (p.level > oldLevel) {
        Achievements.unlock('level_' + p.level, 'Nivel ' + p.level + '!', 'Ai atins nivelul ' + p.level);
      }

      return p;
    },

    updateStreak: function () {
      var p = this.get();
      var today = new Date().toISOString().split('T')[0];
      var lastVisit = p.lastVisit;

      if (lastVisit === today) return p; /* Already counted today */

      if (lastVisit) {
        var last = new Date(lastVisit);
        var now = new Date(today);
        var diff = Math.round((now - last) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          p.streak++;
          if (p.streak >= 3) this.addXP(5, 'Streak ' + p.streak + ' zile');
          if (p.streak >= 7) Achievements.unlock('streak_7', 'O săptămână!', '7 zile consecutive de studiu');
          if (p.streak >= 30) Achievements.unlock('streak_30', 'Dedicat!', '30 zile consecutive');
        } else if (diff > 1) {
          p.streak = 1;
        }
      } else {
        p.streak = 1;
      }

      p.lastVisit = today;
      this.save(p);
      return p;
    }
  };

  /* ══════════════════════════════════════════════════════════
     PAGE ANALYTICS
  ══════════════════════════════════════════════════════════ */
  var Analytics = {
    trackView: function (pageName) {
      pageName = pageName || window.location.pathname;
      var key = 'views_' + pageName.replace(/[^a-z0-9]/gi, '_');
      var count = DB.get(key, 0) + 1;
      DB.set(key, count);

      /* Total views */
      var total = DB.get('total_views', 0) + 1;
      DB.set('total_views', total);

      return count;
    },

    getViews: function (pageName) {
      pageName = pageName || window.location.pathname;
      var key = 'views_' + pageName.replace(/[^a-z0-9]/gi, '_');
      return DB.get(key, 0);
    },

    getTotalViews: function () {
      return DB.get('total_views', 0);
    },

    trackLike: function (pageName) {
      pageName = pageName || window.location.pathname;
      var key = 'liked_' + pageName.replace(/[^a-z0-9]/gi, '_');
      var isLiked = DB.get(key, false);

      if (isLiked) {
        DB.set(key, false);
        var total = Math.max(0, DB.get('total_likes', 0) - 1);
        DB.set('total_likes', total);
        return { liked: false, total: total };
      } else {
        DB.set(key, true);
        var total2 = DB.get('total_likes', 0) + 1;
        DB.set('total_likes', total2);
        UserProfile.addXP(2, 'Like');
        return { liked: true, total: total2 };
      }
    },

    isLiked: function (pageName) {
      pageName = pageName || window.location.pathname;
      var key = 'liked_' + pageName.replace(/[^a-z0-9]/gi, '_');
      return DB.get(key, false);
    },

    getTotalLikes: function () {
      return DB.get('total_likes', 0);
    }
  };

  /* ══════════════════════════════════════════════════════════
     QUIZ SCORES & PROGRESS
  ══════════════════════════════════════════════════════════ */
  var QuizDB = {
    saveScore: function (quizId, score, total) {
      var p = UserProfile.get();
      var prev = p.quizScores[quizId] || { best: 0, attempts: 0 };
      prev.attempts++;
      prev.last = score;
      if (score > prev.best) prev.best = score;
      prev.total = total;
      prev.lastDate = new Date().toISOString();
      p.quizScores[quizId] = prev;
      UserProfile.save(p);

      /* XP rewards */
      var pct = Math.round((score / total) * 100);
      if (pct === 100) {
        UserProfile.addXP(25, 'Quiz perfect: ' + quizId);
        Achievements.unlock('quiz_perfect', 'Perfecțiune!', 'Scor 100% la un quiz');
      } else if (pct >= 80) {
        UserProfile.addXP(15, 'Quiz bun: ' + quizId);
      } else if (pct >= 50) {
        UserProfile.addXP(8, 'Quiz: ' + quizId);
      } else {
        UserProfile.addXP(3, 'Încercare quiz: ' + quizId);
      }

      /* First quiz achievement */
      var totalAttempts = Object.values(p.quizScores).reduce(function (s, q) { return s + q.attempts; }, 0);
      if (totalAttempts === 1) Achievements.unlock('first_quiz', 'Primul Quiz!', 'Ai completat primul quiz');
      if (totalAttempts >= 10) Achievements.unlock('quiz_10', 'Quiz Master!', '10 quiz-uri completate');

      return prev;
    },

    getScore: function (quizId) {
      var p = UserProfile.get();
      return p.quizScores[quizId] || null;
    },

    getAllScores: function () {
      return UserProfile.get().quizScores;
    }
  };

  /* ══════════════════════════════════════════════════════════
     ACHIEVEMENTS SYSTEM
  ══════════════════════════════════════════════════════════ */
  var Achievements = {
    unlock: function (id, title, description) {
      var p = UserProfile.get();
      if (p.achievements.indexOf(id) !== -1) return false; /* Already unlocked */

      p.achievements.push(id);
      UserProfile.save(p);

      /* Show toast notification */
      this.showToast(title, description);
      return true;
    },

    isUnlocked: function (id) {
      var p = UserProfile.get();
      return p.achievements.indexOf(id) !== -1;
    },

    showToast: function (title, desc) {
      var toast = document.getElementById('achievement-toast');
      if (!toast) return;

      toast.querySelector('.toast-title').textContent = title;
      toast.querySelector('.toast-desc').textContent = desc;
      toast.classList.remove('hidden');

      setTimeout(function () {
        toast.classList.add('hidden');
      }, 4000);

      var closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.onclick = function () { toast.classList.add('hidden'); };
      }
    },

    getAll: function () {
      return UserProfile.get().achievements;
    }
  };

  /* ══════════════════════════════════════════════════════════
     CHAPTER PROGRESS
  ══════════════════════════════════════════════════════════ */
  var ChapterProgress = {
    markRead: function (chapterId) {
      var p = UserProfile.get();
      if (p.completedChapters.indexOf(chapterId) === -1) {
        p.completedChapters.push(chapterId);
        UserProfile.save(p);
        UserProfile.addXP(20, 'Capitol citit: ' + chapterId);

        if (p.completedChapters.length === 8) {
          Achievements.unlock('all_chapters', 'Absolvent!', 'Ai parcurs toate cele 8 capitole');
        }
      }
    },

    isRead: function (chapterId) {
      return UserProfile.get().completedChapters.indexOf(chapterId) !== -1;
    },

    getProgress: function () {
      var p = UserProfile.get();
      return {
        completed: p.completedChapters.length,
        total: 8,
        chapters: p.completedChapters
      };
    }
  };

  /* ══════════════════════════════════════════════════════════
     STUDY SESSION TRACKING
  ══════════════════════════════════════════════════════════ */
  var SessionTracker = {
    startTime: Date.now(),

    endSession: function () {
      var elapsed = Math.round((Date.now() - this.startTime) / 1000);
      if (elapsed < 10) return; /* Ignore very short sessions */

      var p = UserProfile.get();
      p.totalTimeSpent = (p.totalTimeSpent || 0) + elapsed;
      UserProfile.save(p);

      /* Time-based achievements */
      var hours = p.totalTimeSpent / 3600;
      if (hours >= 1) Achievements.unlock('time_1h', 'Prima oră!', '1 oră de studiu');
      if (hours >= 5) Achievements.unlock('time_5h', 'Dedicat!', '5 ore de studiu');
      if (hours >= 10) Achievements.unlock('time_10h', 'Expert!', '10 ore de studiu');
    }
  };

  /* ── Save session on page unload ── */
  window.addEventListener('beforeunload', function () {
    SessionTracker.endSession();
  });

  /* ══════════════════════════════════════════════════════════
     EXPORT API
  ══════════════════════════════════════════════════════════ */
  window.InfoDB = {
    raw: DB,
    profile: UserProfile,
    analytics: Analytics,
    quiz: QuizDB,
    achievements: Achievements,
    chapters: ChapterProgress,
    session: SessionTracker
  };

  /* ── Auto-init on page load ── */
  document.addEventListener('DOMContentLoaded', function () {
    UserProfile.updateStreak();
    Analytics.trackView();
  });

})();
