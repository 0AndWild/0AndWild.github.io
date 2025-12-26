// Visitor Statistics Tracking
(function() {
  'use strict';

  // Firebase 초기화 확인
  if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof auth === 'undefined') {
    console.warn('Firebase not initialized for visitor stats');
    return;
  }

  // 방문자 통계 위젯 요소 (홈페이지에만 존재)
  const totalElement = document.getElementById('total-visitors-count');
  const todayElement = document.getElementById('today-visitors-count');

  const STATS_DOC_ID = 'global-stats';
  const LAST_VISIT_KEY = 'last_visit_date';

  // 오늘 날짜 (YYYY-MM-DD 형식)
  function getTodayKey() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // 방문자 통계 업데이트
  function updateVisitorStats() {
    const lastVisitDate = localStorage.getItem(LAST_VISIT_KEY);
    const todayKey = getTodayKey();

    auth.signInAnonymously()
      .then(() => {
        const statsRef = db.collection('site-stats').doc(STATS_DOC_ID);
        const dailyStatsRef = db.collection('daily-stats').doc(todayKey);

        // 오늘 방문자 수 업데이트 (하루에 한 번만)
        if (lastVisitDate !== todayKey) {
          // 일일 방문자 수 증가
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

          // 전체 방문자 수도 함께 증가 (일일 방문자의 누적)
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
      // 위젯이 있는 페이지에서만 통계 표시
      if (totalElement || todayElement) {
        displayVisitorStats();
      }
    });
  } else {
    updateVisitorStats();
    // 위젯이 있는 페이지에서만 통계 표시
    if (totalElement || todayElement) {
      displayVisitorStats();
    }
  }
})();
