// Visitor Statistics Tracking
(function() {
  'use strict';

  // 홈페이지가 아니면 실행하지 않음
  const totalElement = document.getElementById('total-visitors-count');
  const todayElement = document.getElementById('today-visitors-count');

  if (!totalElement && !todayElement) {
    // 방문자 통계 위젯이 없으면 (홈페이지가 아님) 종료
    return;
  }

  // Firebase 초기화 확인
  if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof auth === 'undefined') {
    console.warn('Firebase not initialized for visitor stats');
    return;
  }

  const STATS_DOC_ID = 'global-stats';
  const VISITED_KEY = 'site_visited';
  const LAST_VISIT_KEY = 'last_visit_date';

  // 오늘 날짜 (YYYY-MM-DD 형식)
  function getTodayKey() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // 방문자 통계 업데이트
  function updateVisitorStats() {
    const hasVisited = localStorage.getItem(VISITED_KEY);
    const lastVisitDate = localStorage.getItem(LAST_VISIT_KEY);
    const todayKey = getTodayKey();

    auth.signInAnonymously()
      .then(() => {
        const statsRef = db.collection('site-stats').doc(STATS_DOC_ID);
        const dailyStatsRef = db.collection('daily-stats').doc(todayKey);

        // 전체 방문자 수 업데이트 (최초 방문자만)
        if (!hasVisited) {
          statsRef.get().then((doc) => {
            if (doc.exists) {
              statsRef.update({
                totalVisitors: firebase.firestore.FieldValue.increment(1)
              });
            } else {
              statsRef.set({ totalVisitors: 1 });
            }
          }).catch((error) => {
            console.error('Error updating total visitors:', error);
          });

          localStorage.setItem(VISITED_KEY, 'true');
        }

        // 오늘 방문자 수 업데이트 (하루에 한 번만)
        if (lastVisitDate !== todayKey) {
          dailyStatsRef.get().then((doc) => {
            if (doc.exists) {
              dailyStatsRef.update({
                visitors: firebase.firestore.FieldValue.increment(1)
              });
            } else {
              dailyStatsRef.set({
                visitors: 1,
                date: todayKey
              });
            }
          }).catch((error) => {
            console.error('Error updating daily visitors:', error);
          });

          localStorage.setItem(LAST_VISIT_KEY, todayKey);
        }
      })
      .catch((error) => {
        console.error('Firebase auth error:', error);
      });
  }

  // 방문자 통계 표시
  function displayVisitorStats() {
    const todayKey = getTodayKey();

    // 전체 방문자 수 가져오기
    if (totalElement) {
      db.collection('site-stats').doc(STATS_DOC_ID)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const total = doc.data().totalVisitors || 0;
            totalElement.textContent = total.toLocaleString();
          } else {
            totalElement.textContent = '0';
          }
        }, (error) => {
          console.error('Error fetching total visitors:', error);
          totalElement.textContent = '-';
        });
    }

    // 오늘 방문자 수 가져오기
    if (todayElement) {
      db.collection('daily-stats').doc(todayKey)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const today = doc.data().visitors || 0;
            todayElement.textContent = today.toLocaleString();
          } else {
            todayElement.textContent = '0';
          }
        }, (error) => {
          console.error('Error fetching daily visitors:', error);
          todayElement.textContent = '-';
        });
    }
  }

  // 페이지 로드 시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateVisitorStats();
      displayVisitorStats();
    });
  } else {
    updateVisitorStats();
    displayVisitorStats();
  }
})();
