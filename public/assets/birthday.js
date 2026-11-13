/* LOKRO birthday page — URL params + localStorage only. No backend.
 *
 * Query key is intentionally "reciever". Names are applied via textContent.
 */

(function () {
  'use strict';

  var KEY = 'lokro-birthday';
  var MAX = 80;

  function sanitizeName(v) {
    var s = String(v == null ? '' : v);

    s = s
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (s.length > MAX) {
      s = s.slice(0, MAX);
    }

    return s;
  }

  function loadStored() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');

      if (raw && typeof raw === 'object') {
        return {
          reciever: sanitizeName(raw.reciever),
          caller: sanitizeName(raw.caller)
        };
      }
    } catch (e) {}

    return {
      reciever: '',
      caller: ''
    };
  }

  function saveStored(reciever, caller) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          reciever: reciever,
          caller: caller
        })
      );
    } catch (e) {}
  }

  function delStored() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
  }

  function isSaveFlag(v) {
    if (v == null || v === '') {
      return false;
    }

    v = String(v).toLowerCase();

    return v === 'true' || v === '1' || v === 'yes';
  }

  function setText(id, value) {
    var el = document.getElementById(id);

    if (el) {
      el.textContent = value;
    }
  }

  function show(id, on) {
    var el = document.getElementById(id);

    if (!el) {
      return;
    }

    if (on) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  function resolveNames() {
    var params = new URLSearchParams(window.location.search);

    var hasUrl =
      params.has('reciever') ||
      params.has('caller');

    var fromUrlRec = sanitizeName(
      params.get('reciever')
    );

    var fromUrlCaller = sanitizeName(
      params.get('caller')
    );

    var shouldSave = isSaveFlag(
      params.get('saveName')
    );

    var shouldDelete = isSaveFlag(
      params.get('delete')
    );

    if (shouldDelete) {
      delStored();

      return {
        reciever: '',
        caller: ''
      };
    }

    if (fromUrlRec && fromUrlCaller) {
      if (shouldSave) {
        saveStored(
          fromUrlRec,
          fromUrlCaller
        );
      }

      return {
        reciever: fromUrlRec,
        caller: fromUrlCaller
      };
    }

    if (hasUrl) {
      return {
        reciever: fromUrlRec,
        caller: fromUrlCaller
      };
    }

    return loadStored();
  }

  function render() {
    var names = resolveNames();

    var has =
      !!(
        names.reciever &&
        names.caller
      );

    show('bd-card', has);
    show('bd-empty', !has);

    if (has) {
      setText(
        'bd-reciever',
        names.reciever
      );

      setText(
        'bd-caller',
        names.caller
      );

      var recIn =
        document.getElementById(
          'bd-in-reciever'
        );

      var callIn =
        document.getElementById(
          'bd-in-caller'
        );

      if (recIn) {
        recIn.value = names.reciever;
      }

      if (callIn) {
        callIn.value = names.caller;
      }
    }
  }

  function onSubmit(e) {
    if (
      e &&
      typeof e.preventDefault === 'function'
    ) {
      e.preventDefault();
    }

    var recieverInput =
      document.getElementById(
        'bd-in-reciever'
      );

    var callerInput =
      document.getElementById(
        'bd-in-caller'
      );

    var reciever = sanitizeName(
      recieverInput &&
      typeof recieverInput.value !== 'undefined'
        ? recieverInput.value
        : ''
    );

    var caller = sanitizeName(
      callerInput &&
      typeof callerInput.value !== 'undefined'
        ? callerInput.value
        : ''
    );

    if (!reciever || !caller) {
      return;
    }

    saveStored(
      reciever,
      caller
    );

    /*
     * Use pathname instead of the current full URL
     * so query parameters do not keep duplicating.
     */
    var next = new URL(
      window.location.pathname,
      window.location.origin
    );

    next.searchParams.set(
      'reciever',
      reciever
    );

    next.searchParams.set(
      'caller',
      caller
    );

    next.searchParams.set(
      'saveName',
      'true'
    );

    window.history.replaceState(
      {},
      '',
      next
    );

    render();

    var card =
      document.getElementById(
        'bd-card'
      );

    if (
      card &&
      typeof card.scrollIntoView === 'function'
    ) {
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  document.addEventListener(
    'DOMContentLoaded',
    function () {
      render();

      var form =
        document.getElementById(
          'bd-form'
        );

      if (!form) {
        return;
      }

      form.addEventListener(
        'submit',
        onSubmit,
        false
      );
    }
  );
})();
