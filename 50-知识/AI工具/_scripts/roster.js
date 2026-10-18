/* 十年之约 · 成员名录。只管理筛选与分页界面，不改变成员资格或状态。 */
(function () {
  'use strict';

  var page = document.querySelector('[data-roster-page]');
  if (!page) return;

  var grid = page.querySelector('[data-roster-grid]');
  var more = page.querySelector('[data-roster-more]');
  var retry = page.querySelector('[data-roster-retry]');
  var error = page.querySelector('[data-roster-error]');
  var end = page.querySelector('[data-roster-end]');
  var year = page.querySelector('[data-roster-year]');
  var currentPage = Number(page.dataset.page || 1);
  var lastPage = Number(page.dataset.lastPage || 1);
  var isLoading = false;

  function node(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function icon(name, size) {
    var el = document.createElement('fb-ic');
    el.setAttribute('name', name);
    el.setAttribute('size', String(size || 14));
    return el;
  }

  function placeholder(shot, name) {
    shot.replaceChildren();
    var box = node('span', 'roster-card__placeholder');
    var dark = node('img', 'theme-illustration theme-illustration--dark');
    dark.src = '/assets/images/site-v10/placeholder-shot-dark.webp';
    dark.alt = '暂无首页截图';
    dark.loading = 'lazy';
    var light = node('img', 'theme-illustration theme-illustration--light');
    light.src = '/assets/images/site-v10/placeholder-shot-light.webp';
    light.alt = '';
    light.setAttribute('aria-hidden', 'true');
    light.loading = 'lazy';
    box.append(dark, light);
    shot.append(box);
  }

  function protectImage(img, name) {
    img.addEventListener('error', function () {
      placeholder(img.closest('.roster-card__shot'), name);
    }, { once: true });
  }

  function renderCard(card) {
    var link = node('a', 'roster-card roster-card--' + card.status_key);
    link.href = card.url;
    link.dataset.rosterCard = '';
    link.dataset.rosterId = card.id;
    link.dataset.status = card.status_key;
    link.dataset.category = card.category_label;
    link.setAttribute('aria-label', '查看 ' + card.name + ' 的成员详情');

    var shot = node('span', 'roster-card__shot');
    if (card.screenshot) {
      var img = node('img');
      img.src = card.screenshot;
      img.alt = card.name + ' 的首页截图';
      img.loading = 'lazy';
      protectImage(img, card.name);
      shot.append(img);
    } else {
      placeholder(shot, card.name);
    }
    if (card.anniversary_badge) {
      var badge = node('img', 'roster-card__badge');
      badge.src = card.anniversary_badge;
      badge.alt = card.anniversary_badge_alt || '';
      shot.append(badge);
    }

    var years = node('span', 'roster-card__years' + (card.is_year_muted ? ' is-muted' : ''));
    if (card.is_ten_years) {
      years.append(node('b', '', '10 年'));
    } else if (!card.is_year_muted) {
      years.append(node('i'));
    }
    years.append(document.createTextNode(card.year_label));

    var heading = node('span', 'roster-card__heading');
    heading.append(node('strong', '', card.name));
    var status = node('span', 'roster-status roster-status--' + card.status_key);
    status.append(node('i'), document.createTextNode(card.status_label));
    heading.append(status);

    var meta = node('span', 'roster-card__meta');
    var date = node('span', 'roster-card__date');
    if (card.updated_is_date) date.append(icon('clock', 12));
    date.append(document.createTextNode(card.updated_label));
    meta.append(date);
    var topicLabels = card.category_labels || [];
    var topic = topicLabels.length ? node('span', 'topic-label') : null;
    if (topic) {
      topic.dataset.category = card.category_label;
      topic.append(icon(card.category_label, 13), document.createTextNode(topicLabels.join('/')));
    }
    meta.append(topic);

    link.append(shot, years, heading, meta);
    return link;
  }

  function setLoading(loading) {
    isLoading = loading;
    if (!more) return;
    more.disabled = loading;
    // is-loading 触发按钮上的转圈动画（CSS .site-button.is-loading）；文字同步成「正在加载」
    more.classList.toggle('is-loading', loading);
    more.textContent = loading ? '正在加载' : '显示更多';
  }

  function showFailure() {
    if (error) error.hidden = false;
    if (more) more.hidden = true;
  }

  function loadMore() {
    if (isLoading || currentPage >= lastPage || !grid) return Promise.resolve(false);
    setLoading(true);
    if (error) error.hidden = true;

    var url = new URL(page.dataset.endpoint, window.location.origin);
    url.searchParams.set('page', String(currentPage + 1));
    var payload = new FormData();
    if (year && year.value) payload.append('year', year.value);
    page.querySelectorAll('input[name="cat[]"]').forEach(function (input) {
      payload.append('cat[]', input.value);
    });

    return fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: payload
    }).then(function (response) {
      if (!response.ok) throw new Error('roster request failed');
      return response.json();
    }).then(function (response) {
      (response.data || []).forEach(function (card) { grid.append(renderCard(card)); });
      currentPage = Number(response.current_page || currentPage + 1);
      lastPage = Number(response.last_page || lastPage);
      if (window.FB10_IC_PAINT) window.FB10_IC_PAINT(grid);
      if (currentPage >= lastPage || !(response.data || []).length) {
        more.hidden = true;
        if (end) end.hidden = false;
      }
      return true;
    }).catch(showFailure).finally(function () {
      setLoading(false);
    });
  }

  function rememberReturnState(event) {
    var card = event.target.closest && event.target.closest('[data-roster-card]');
    if (!card || !card.href || !grid.contains(card)) return;
    try {
      sessionStorage.setItem('fb10_roster_return', JSON.stringify({
        url: window.location.pathname + window.location.search,
        page: currentPage,
        scrollY: window.scrollY,
        sourceId: card.dataset.rosterId
      }));
    } catch (cause) {}
  }

  function restoreReturnState() {
    var state;
    try { state = JSON.parse(sessionStorage.getItem('fb10_roster_return') || 'null'); } catch (cause) { return; }
    if (!state || state.url !== window.location.pathname + window.location.search) return;
    function finish() {
      var source = page.querySelector('[data-roster-id="' + state.sourceId + '"]');
      if (source) source.scrollIntoView({ block: 'center' });
      else window.scrollTo(0, Number(state.scrollY || 0));
      try { sessionStorage.removeItem('fb10_roster_return'); } catch (cause) {}
    }
    function loadUntilRestored() {
      if (currentPage >= Number(state.page || 1)) { finish(); return; }
      loadMore().then(function (loaded) {
        if (loaded) loadUntilRestored();
        else finish();
      });
    }
    loadUntilRestored();
  }

  document.querySelectorAll('[data-roster-card] .roster-card__shot > img:not(.roster-card__badge)').forEach(function (img) {
    protectImage(img, img.alt.replace(/ 的首页截图$/, ''));
  });
  if (grid) grid.addEventListener('click', rememberReturnState);
  if (year) year.addEventListener('change', function () { year.form.submit(); });
  var legend = page.querySelector('[data-roster-legend]');
  if (legend) {
    var wideLegend = window.matchMedia && window.matchMedia('(min-width: 820px)');
    var syncLegend = function (event) {
      legend.open = event ? event.matches : window.innerWidth >= 820;
    };
    syncLegend();
    if (wideLegend && wideLegend.addEventListener) wideLegend.addEventListener('change', syncLegend);
  }
  if (more) more.addEventListener('click', loadMore);
  if (retry) retry.addEventListener('click', function () {
    if (error) error.hidden = true;
    if (more) more.hidden = false;
    loadMore();
  });
  restoreReturnState();
}());
