(function () {
    "use strict";

    var body = document.body;
    body.classList.add("noiraura-luxury");

    var pageName = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    function pageKind() {
        if (body.dataset.page === "dashboard") return "dashboard";
        if (pageName === "index.html") return "home";
        if (pageName === "ab.html") return "about";
        if (pageName === "ra.html") return "reviews";
        if (pageName === "co.html") return "contact";
        if (pageName === "he.html") return "help";
        if (pageName === "new.html") return "new-arrivals";
        if (pageName === "limi.html") return "limited";
        if (/^(bestse|sam|gif|men\d+|women\d+|c|w|o|s|se)\.html$/.test(pageName)) return "collection";
        return "content";
    }

    function initPageIdentity() {
        var kind = pageKind();
        if (kind === "limited" && !body.dataset.page) body.dataset.page = "limited";
        if (kind === "new-arrivals" && !body.dataset.page) body.dataset.page = "new-arrivals";
        body.dataset.noirPageKind = pageKind();
        body.classList.add("noir-page-" + body.dataset.noirPageKind);
    }

    initPageIdentity();

    var scentProfiles = [
        {
            test: /oud|royal|noir|midnight|executive|iqbal|zor|reset|leather|amber/i,
            family: "Woody Amber",
            notes: {
                top: ["Bergamot", "Saffron"],
                heart: ["Oud", "Jasmine"],
                base: ["Amber", "Musk"]
            },
            profile: { Woody: 92, Warm: 78, Sweet: 42, Fresh: 30 }
        },
        {
            test: /floral|rose|jasmine|bloom|orchid|poetic|barg/i,
            family: "Floral Musk",
            notes: {
                top: ["Pear", "Rose"],
                heart: ["Jasmine", "Peony"],
                base: ["White Musk", "Vanilla"]
            },
            profile: { Floral: 92, Sweet: 58, Fresh: 44, Warm: 35 }
        },
        {
            test: /citrus|fresh|light|sail|mist|samula|sample/i,
            family: "Fresh Citrus",
            notes: {
                top: ["Mandarin", "Bergamot"],
                heart: ["Neroli", "Tea"],
                base: ["Cedar", "Musk"]
            },
            profile: { Fresh: 90, Citrus: 76, Floral: 38, Warm: 24 }
        },
        {
            test: /sweet|velvet|vanilla|gold|gift|heavenly|warm/i,
            family: "Gourmand Floral",
            notes: {
                top: ["Pink Pepper", "Plum"],
                heart: ["Vanilla", "Iris"],
                base: ["Tonka", "Amber"]
            },
            profile: { Sweet: 88, Warm: 72, Floral: 50, Woody: 30 }
        }
    ];

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function getProfile(name) {
        return scentProfiles.find(function (profile) {
            return profile.test.test(name || "");
        }) || {
            family: "Signature Aura",
            notes: {
                top: ["Bergamot", "Violet"],
                heart: ["Rose", "Oud"],
                base: ["Amber", "Musk"]
            },
            profile: { Woody: 62, Sweet: 48, Floral: 56, Fresh: 40 }
        };
    }

    function safeJson(key, fallback) {
        try {
            var value = JSON.parse(localStorage.getItem(key));
            return value || fallback;
        } catch (error) {
            return fallback;
        }
    }

    function saveJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    var routedStorageKeys = {
        noirAuraCart: true,
        noirAuraWishlist: true,
        noirAuraOrders: true
    };

    var nativeStorageGet = Storage.prototype.getItem;
    var nativeStorageSet = Storage.prototype.setItem;
    var nativeStorageRemove = Storage.prototype.removeItem;

    function rawGet(key) {
        return nativeStorageGet.call(localStorage, key);
    }

    function rawSet(key, value) {
        nativeStorageSet.call(localStorage, key, value);
    }

    function rawRemove(key) {
        nativeStorageRemove.call(localStorage, key);
    }

    function rawJson(key, fallback) {
        try {
            var value = JSON.parse(rawGet(key));
            return value || fallback;
        } catch (error) {
            return fallback;
        }
    }

    function saveRawJson(key, value) {
        rawSet(key, JSON.stringify(value));
    }

    function normalizeEmail(email) {
        return String(email || "").trim().toLowerCase();
    }

    function displayName(user) {
        return (user && (user.displayName || user.fullName || user.name)) || "Guest";
    }

    function profileZip(user) {
        return (user && (user.postalCode || user.zipCode)) || "";
    }

    function publicUser(user) {
        if (!user) return null;
        return {
            id: user.id,
            fullName: user.fullName,
            displayName: user.displayName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city,
            postalCode: user.postalCode,
            zipCode: user.zipCode,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    function publicAccountResult(result) {
        var copy = Object.assign({}, result);
        if (copy.user) copy.user = publicUser(copy.user);
        return copy;
    }

    function normalizeUserStore(store) {
        if (!store || typeof store !== "object" || Array.isArray(store)) {
            store = { version: 1, byId: {}, byEmail: {} };
        }
        store.version = store.version || 1;
        store.byId = store.byId || {};
        store.byEmail = {};

        Object.keys(store.byId).forEach(function (id) {
            var user = store.byId[id];
            if (!user || typeof user !== "object") {
                delete store.byId[id];
                return;
            }
            user.id = user.id || id;
            user.email = normalizeEmail(user.email);
            user.fullName = String(user.fullName || user.name || user.displayName || user.email.split("@")[0] || "").trim();
            user.displayName = String(user.displayName || user.fullName || user.email.split("@")[0] || "").trim();
            user.phone = String(user.phone || "").trim();
            user.address = String(user.address || "").trim();
            user.city = String(user.city || "").trim();
            user.postalCode = String(user.postalCode || user.zipCode || "").trim();
            user.zipCode = user.postalCode;
            if (user.email) store.byEmail[user.email] = user.id;
        });

        return store;
    }

    function userStore() {
        return normalizeUserStore(rawJson("noirAuraUsers", { version: 1, byId: {}, byEmail: {} }));
    }

    function saveUserStore(store) {
        saveRawJson("noirAuraUsers", normalizeUserStore(store));
    }

    function makeUserId() {
        return "na_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    }

    function hashPassword(password, salt) {
        var input = String(salt || "") + "|" + String(password || "");
        var h1 = 0xdeadbeef ^ input.length;
        var h2 = 0x41c6ce57 ^ input.length;
        for (var index = 0; index < input.length; index += 1) {
            var ch = input.charCodeAt(index);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
    }

    function passwordIssues(password) {
        var issues = [];
        if (!password || password.length < 8) issues.push("at least 8 characters");
        if (password && password.length > 64) issues.push("64 characters or fewer");
        if (!/[A-Z]/.test(password || "")) issues.push("one uppercase letter");
        if (!/[a-z]/.test(password || "")) issues.push("one lowercase letter");
        if (!/\d/.test(password || "")) issues.push("one number");
        return issues;
    }

    function findUserByEmail(email) {
        var store = userStore();
        var normalized = normalizeEmail(email);
        var id = store.byEmail[normalized];
        return id ? store.byId[id] : null;
    }

    function currentUser() {
        var store = userStore();
        var id = rawGet("noirAuraCurrentUserId");
        if (id && store.byId[id]) return store.byId[id];

        var legacyEmail = normalizeEmail(rawGet("noirAuraUserEmail"));
        if (legacyEmail && store.byEmail[legacyEmail]) {
            var legacyUser = store.byId[store.byEmail[legacyEmail]];
            setCurrentUser(legacyUser, false);
            return legacyUser;
        }

        if (rawGet("noirAuraUser") || rawGet("noirAuraUserEmail")) {
            clearCurrentUser(false);
        }
        return null;
    }

    function syncLegacySession(user) {
        if (!user) return;
        rawSet("noirAuraCurrentUserId", user.id);
        rawSet("noirAuraUser", displayName(user));
        rawSet("noirAuraUserEmail", user.email || "");
        rawSet("noirAuraUserZipCode", profileZip(user));
    }

    function setCurrentUser(user, announce) {
        syncLegacySession(user);
        if (announce !== false) {
            announceSessionChange();
        }
    }

    function clearCurrentUser(announce) {
        ["noirAuraCurrentUserId", "noirAuraUser", "noirAuraUserEmail", "noirAuraUserZipCode"].forEach(rawRemove);
        if (announce !== false) {
            announceSessionChange();
        }
    }

    function userDataKey(baseKey, userId) {
        return baseKey + "_" + userId;
    }

    function currentUserDataKey(baseKey) {
        var user = currentUser();
        return user ? userDataKey(baseKey, user.id) : "";
    }

    function readUserData(baseKey, fallback) {
        var key = currentUserDataKey(baseKey);
        return key ? rawJson(key, fallback) : fallback;
    }

    function saveUserData(baseKey, value) {
        var key = currentUserDataKey(baseKey);
        if (key) saveRawJson(key, value);
    }

    function checkoutSnapshot(user) {
        var selectedPayment = $('input[name="payment"]:checked, input[name="paymentMethod"]:checked');
        var selectedPaymentCard = selectedPayment && selectedPayment.closest(".payment-method");
        return {
            fullName: ($("#fullName") && $("#fullName").value.trim()) || displayName(user),
            email: ($("#email") && normalizeEmail($("#email").value)) || (user && user.email) || "",
            phone: ($("#phone") && $("#phone").value.trim()) || (user && user.phone) || "",
            address: ($("#address") && $("#address").value.trim()) || (user && user.address) || "",
            city: ($("#city") && $("#city").value.trim()) || (user && user.city) || "",
            postalCode: ($("#zipCode") && $("#zipCode").value.trim()) || profileZip(user),
            country: ($("#country") && $("#country").value.trim()) || "Pakistan",
            paymentMethod: selectedPaymentCard ? selectedPaymentCard.dataset.method : "credit"
        };
    }

    function normalizeOrderPayload(serialized, user) {
        try {
            var orders = JSON.parse(serialized);
            if (!Array.isArray(orders)) return serialized;
            var checkout = checkoutSnapshot(user);
            return JSON.stringify(orders.map(function (order) {
                if (!order || typeof order !== "object") return order;
                order.userId = user.id;
                order.customer = order.customer || {
                    name: checkout.fullName,
                    email: checkout.email,
                    phone: checkout.phone,
                    address: checkout.address,
                    city: checkout.city,
                    postalCode: checkout.postalCode,
                    country: checkout.country
                };
                order.paymentMethod = order.paymentMethod || checkout.paymentMethod;
                order.orderDate = order.orderDate || new Date().toISOString();
                return order;
            }));
        } catch (error) {
            return serialized;
        }
    }

    function announceSessionChange() {
        setTimeout(function () {
            document.dispatchEvent(new CustomEvent("noiraura:session-changed"));
            document.dispatchEvent(new CustomEvent("noiraura:user-data-updated"));
        }, 0);
    }

    function announceUserDataChange() {
        setTimeout(function () {
            document.dispatchEvent(new CustomEvent("noiraura:user-data-updated"));
        }, 0);
    }

    function createAccount(details) {
        var store = userStore();
        var email = normalizeEmail(details.email);
        var name = String(details.name || "").trim();
        var zip = String(details.zipCode || "").trim();
        var issues = passwordIssues(details.password);

        if (!name) return { ok: false, message: "Please enter your full name." };
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Please enter a valid email address." };
        if (store.byEmail[email]) return { ok: false, message: "An account already exists with this email. Please log in." };
        if (issues.length) return { ok: false, message: "Password needs " + issues.join(", ") + "." };
        if (details.password !== details.confirmPassword) return { ok: false, message: "Passwords do not match." };
        if (!zip) return { ok: false, message: "Please enter your postal code." };

        var id = makeUserId();
        var user = {
            id: id,
            fullName: name,
            displayName: name,
            email: email,
            phone: "",
            address: "",
            city: "",
            postalCode: zip,
            zipCode: zip,
            passwordSalt: id,
            passwordHash: hashPassword(details.password, id),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        store.byId[id] = user;
        store.byEmail[email] = id;
        saveUserStore(store);
        setCurrentUser(user);
        return { ok: true, user: user, message: "Welcome to NoirAura, " + name + "." };
    }

    function loginAccount(email, password) {
        var user = findUserByEmail(email);
        if (!user) {
            return { ok: false, message: "No account found with this email. Please sign up first." };
        }
        if (user.passwordHash !== hashPassword(password, user.passwordSalt || user.id)) {
            return { ok: false, message: "Incorrect password. Please try again." };
        }
        setCurrentUser(user);
        return { ok: true, user: user, message: "Welcome back, " + displayName(user) + "." };
    }

    function updateCurrentUserProfile(values) {
        var user = currentUser();
        if (!user) return { ok: false, message: "Please sign in before editing your profile." };

        var store = userStore();
        var saved = store.byId[user.id];
        if (!saved) return { ok: false, message: "Your account could not be found. Please sign in again." };

        var nextEmail = normalizeEmail(values.email);
        if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
            return { ok: false, message: "Please enter a valid email address." };
        }
        if (store.byEmail[nextEmail] && store.byEmail[nextEmail] !== saved.id) {
            return { ok: false, message: "Another NoirAura account already uses that email." };
        }

        delete store.byEmail[saved.email];
        saved.fullName = String(values.fullName || saved.fullName).trim();
        saved.displayName = saved.fullName;
        saved.email = nextEmail;
        saved.phone = String(values.phone || "").trim();
        saved.address = String(values.address || "").trim();
        saved.city = String(values.city || "").trim();
        saved.postalCode = String(values.postalCode || "").trim();
        saved.zipCode = saved.postalCode;
        saved.updatedAt = new Date().toISOString();
        store.byEmail[saved.email] = saved.id;
        store.byId[saved.id] = saved;
        saveUserStore(store);
        setCurrentUser(saved);
        return { ok: true, user: saved, message: "Account details saved." };
    }

    function installUserStorageRouting() {
        if (window.__NoirAuraStorageRoutingInstalled) return;
        window.__NoirAuraStorageRoutingInstalled = true;

        Storage.prototype.getItem = function (key) {
            if (this === localStorage && routedStorageKeys[key]) {
                var mappedKey = currentUserDataKey(key);
                return mappedKey ? nativeStorageGet.call(this, mappedKey) : null;
            }
            return nativeStorageGet.call(this, key);
        };

        Storage.prototype.setItem = function (key, value) {
            if (this === localStorage && routedStorageKeys[key]) {
                var user = currentUser();
                if (!user) return;
                var serialized = String(value);
                if (key === "noirAuraOrders") serialized = normalizeOrderPayload(serialized, user);
                nativeStorageSet.call(this, userDataKey(key, user.id), serialized);
                announceUserDataChange();
                return;
            }
            nativeStorageSet.call(this, key, value);
        };

        Storage.prototype.removeItem = function (key) {
            if (this === localStorage && routedStorageKeys[key]) {
                var mappedKey = currentUserDataKey(key);
                if (mappedKey) nativeStorageRemove.call(this, mappedKey);
                announceUserDataChange();
                return;
            }
            nativeStorageRemove.call(this, key);
        };
    }

    installUserStorageRouting();

    window.NoirAuraAccounts = {
        currentUser: function () { return publicUser(currentUser()); },
        createAccount: function (details) { return publicAccountResult(createAccount(details)); },
        loginAccount: function (email, password) { return publicAccountResult(loginAccount(email, password)); },
        logout: clearCurrentUser,
        readCart: function () { return readUserData("noirAuraCart", []); },
        readWishlist: function () { return wishlistItems(); },
        readOrders: function () { return readUserData("noirAuraOrders", []); }
    };

    function normalizeText(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function parsePrice(value) {
        return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }

    function currentPage() {
        return (location.pathname.split("/").pop() || "index.html").toLowerCase();
    }

    function getProfileNotes(profile) {
        return []
            .concat(profile.notes.top || [])
            .concat(profile.notes.heart || [])
            .concat(profile.notes.base || []);
    }

    function productSearchText(item) {
        return normalizeText([
            item.name,
            item.category,
            item.collection,
            item.family,
            item.gender,
            splitTags(item.tags).join(" "),
            (item.notes || []).join(" "),
            item.page
        ].join(" "));
    }

    function splitTags(value) {
        if (Array.isArray(value)) return value.filter(Boolean);
        return String(value || "")
            .split("|")
            .map(function (tag) { return tag.trim(); })
            .filter(Boolean);
    }

    function pageProductTags() {
        var page = currentPage();
        if (page === "bestse.html") return ["Trending", "Best Rated"];
        if (page === "sam.html") return ["Sample Set", "Featured"];
        if (page === "gif.html") return ["Gift Set", "Featured"];
        if (page === "new.html") return ["New", "Trending"];
        if (page === "limi.html") return ["Limited", "Exclusive"];
        return [];
    }

    function productDetailUrl(item) {
        var page = item.page || "index.html";
        if (!item.productId) return page;
        return page + "?product=" + encodeURIComponent(item.productId);
    }

    function productIntentText(item) {
        return normalizeText([
            item.page,
            item.collection,
            item.category,
            item.family,
            item.gender,
            splitTags(item.tags).join(" ")
        ].join(" "));
    }

    function hasProductSignal(item, pattern) {
        return pattern.test(productIntentText(item));
    }

    function searchRelevance(item, query, terms) {
        var name = normalizeText(item.name);
        var category = normalizeText([item.collection, item.category, item.gender, item.family].join(" "));
        var notes = normalizeText((item.notes || []).join(" "));
        var score = 0;
        if (name === query) score += 120;
        if (name.indexOf(query) === 0) score += 70;
        else if (name.indexOf(query) >= 0) score += 48;
        terms.forEach(function (term) {
            if (name.indexOf(term) >= 0) score += 18;
            if (category.indexOf(term) >= 0) score += 8;
            if (notes.indexOf(term) >= 0) score += 6;
            if (item.searchText && item.searchText.indexOf(term) >= 0) score += 2;
        });
        return score;
    }

    function getSearchIndex() {
        var index = Array.isArray(window.NoirAuraProductIndex) ? window.NoirAuraProductIndex.slice() : [];
        if (!index.length) {
            $$(".perfume-card").forEach(function (card, indexNumber) {
                var title = $(".perfume-info h3", card);
                var price = $(".perfume-info p", card);
                if (!title || !price) return;
                var profile = getProfile(title.textContent);
                index.push({
                    id: currentPage() + "|" + indexNumber + "|" + title.textContent.trim(),
                    productId: String(indexNumber + 1),
                    name: title.textContent.trim(),
                    price: parsePrice(price.textContent),
                    priceText: price.textContent.trim(),
                    image: imageFromCard(card),
                    page: currentPage(),
                    category: pageLabel(),
                    family: profile.family.replace(" Amber", "").replace(" Musk", ""),
                    gender: /men/i.test(pageLabel()) ? "Men" : /women/i.test(pageLabel()) ? "Women" : "Unisex",
                    tags: [],
                    notes: getProfileNotes(profile)
                });
            });
        }
        return index.map(function (item, rank) {
            var profile = getProfile(item.name + " " + item.family);
            item.rank = Number.isFinite(Number(item.rank)) ? Number(item.rank) : rank;
            item.collection = item.collection || item.category || pageLabel();
            item.tags = splitTags(item.tags);
            if (!item.notes || !item.notes.length) item.notes = getProfileNotes(profile);
            if (!item.family) item.family = profile.family;
            if (!item.gender) item.gender = /men/i.test(item.category || item.page) ? "Men" : /women/i.test(item.category || item.page) ? "Women" : "Unisex";
            item.searchText = productSearchText(item);
            return item;
        });
    }

    function normalizeNavBadges() {
        var ordersIcon = $("#ordersIcon");
        var orderCount = $("#orderCount");
        if (ordersIcon && orderCount && !ordersIcon.parentElement.classList.contains("order-icon-container")) {
            var wrapper = document.createElement("div");
            wrapper.className = "order-icon-container";
            ordersIcon.parentNode.insertBefore(wrapper, ordersIcon);
            wrapper.appendChild(ordersIcon);
            wrapper.appendChild(orderCount);
        }

        var cartIcon = $("#cartIcon");
        var cartCount = $("#cartCount");
        if (cartIcon && cartCount && !cartIcon.parentElement.classList.contains("cart-icon-container")) {
            var cartWrapper = document.createElement("div");
            cartWrapper.className = "cart-icon-container";
            cartIcon.parentNode.insertBefore(cartWrapper, cartIcon);
            cartWrapper.appendChild(cartIcon);
            cartWrapper.appendChild(cartCount);
        }

        var greeting = $("#userGreeting");
        if (greeting) {
            greeting.textContent = greeting.textContent.replace(/^\s*\d+\s*/, "").trim();
        }
    }

    function imageFromCard(card) {
        var image = $(".perfume-img", card);
        if (!image) return "";
        var match = image.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
        return match ? match[1] : "";
    }

    function pageLabel() {
        var heading = $(".page-header h1") || $(".hero h1") || $(".about-hero h1") || $(".hero-section h1");
        if (!heading) return "NoirAura";
        return heading.textContent.trim();
    }

    function initLayoutOffsets() {
        var header = $("header");
        var ticking = false;

        function syncOffsets() {
            ticking = false;
            var headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 82;
            body.style.setProperty("--noir-header-height", headerHeight + "px");
            body.style.setProperty("--noir-promo-height", "44px");
        }

        function requestSync() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(syncOffsets);
        }

        syncOffsets();
        window.addEventListener("resize", requestSync, { passive: true });
        setTimeout(syncOffsets, 250);
        setTimeout(syncOffsets, 900);
    }

    function initHomeHeroVideo() {
        var hero = $(".home-video-hero");
        var video = hero ? $(".hero-video", hero) : null;
        if (!hero || !video || video.dataset.noirVideoReady === "true") return;

        video.dataset.noirVideoReady = "true";
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.controls = false;
        video.setAttribute("muted", "");
        video.setAttribute("loop", "");
        video.setAttribute("autoplay", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.removeAttribute("controls");

        function syncRatio() {
            if (video.videoWidth && video.videoHeight) {
                hero.style.setProperty("--hero-video-ratio", video.videoWidth + " / " + video.videoHeight);
            }
        }

        function markReady() {
            syncRatio();
            hero.classList.add("is-video-ready");
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") playPromise.catch(function () {});
        }

        video.addEventListener("loadedmetadata", syncRatio);
        video.addEventListener("loadeddata", markReady, { once: true });
        video.addEventListener("canplay", function () {
            markReady();
            playVideo();
        }, { once: true });
        video.addEventListener("playing", function () {
            hero.classList.add("is-video-playing");
        });
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) playVideo();
        });

        if (video.readyState >= 1) syncRatio();
        if (video.readyState >= 2) markReady();
        setTimeout(playVideo, 120);
    }

    function initPromoBannerBehavior() {
        var promo = $(".promo-bar-container");
        var isPromoPage = body.dataset.page === "limited" || body.dataset.page === "new-arrivals";
        if (!promo || !isPromoPage) return;

        body.classList.add("noir-has-promo");
        var hidden = false;
        var ticking = false;

        function setHidden(nextHidden) {
            if (hidden === nextHidden) return;
            hidden = nextHidden;
            body.classList.toggle("noir-promo-hidden", hidden);
        }

        function updatePromoState() {
            ticking = false;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            if (hidden) {
                setHidden(scrollTop > 12);
            } else {
                setHidden(scrollTop > 48);
            }
        }

        function requestUpdate() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updatePromoState);
        }

        updatePromoState();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate, { passive: true });
    }

    function initHeader() {
        var header = $("header");
        var logo = $(".logo");
        var shopButton = $(".hero .btn[href='#']");

        normalizeNavBadges();

        if (logo) logo.setAttribute("href", "index.html");
        if (shopButton && /shop/i.test(shopButton.textContent)) shopButton.setAttribute("href", "bestse.html");

        function setScrolled() {
            if (!header) return;
            header.classList.toggle("noir-scrolled", window.scrollY > 28);
        }

        setScrolled();
        window.addEventListener("scroll", setScrolled, { passive: true });

        var current = currentPage();
        $$(".nav-links a").forEach(function (link) {
            var href = link.getAttribute("href");
            if (href && href.split("#")[0] === current) link.classList.add("is-current");
        });
    }

    function initMegaMenu() {
        var menu = $(".mega-menu");
        var trigger = $(".has-mega-menu");
        if (!menu || !trigger) return;
        var triggerLink = $(".has-mega-menu > a");
        var closeTimer = 0;
        var hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
        var desktopMedia = window.matchMedia("(min-width: 901px)");

        var labels = [
            ["For Him", "Woody, fresh, oud, and modern body mists."],
            ["For Her", "Floral, sweet, oriental, and luminous signatures."],
            ["Discover", "Shop by fragrance family and scent mood."],
            ["Noir Edit", "Best sellers, sets, arrivals, and limited editions."]
        ];

        $$(".mega-column", menu).forEach(function (column, index) {
            var title = $("h4", column);
            if (title && labels[index]) title.textContent = labels[index][0];
            if (!$(".mega-kicker", column) && labels[index]) {
                var kicker = document.createElement("p");
                kicker.className = "mega-kicker";
                kicker.textContent = labels[index][1];
                title && title.insertAdjacentElement("afterend", kicker);
            }
        });

        if (!$(".mega-feature", menu)) {
            var feature = document.createElement("div");
            feature.className = "mega-feature";
            feature.innerHTML = [
                '<span class="eyebrow">The Noir Collection</span>',
                "<h3>Discover the darker side of scent.</h3>",
                "<p>Layered woods, soft amber, and a midnight aura made for lasting presence.</p>",
                '<a href="bestse.html">Explore Collection -&gt;</a>'
            ].join("");
            menu.appendChild(feature);
        }

        function setOpen(open) {
            window.clearTimeout(closeTimer);
            menu.classList.toggle("active", open);
            trigger.classList.toggle("menu-open", open);
            trigger.classList.toggle("open", open && !desktopMedia.matches);
            if (triggerLink) triggerLink.setAttribute("aria-expanded", open ? "true" : "false");
        }

        function canHoverOpen() {
            return hoverMedia.matches && desktopMedia.matches;
        }

        function scheduleClose() {
            window.clearTimeout(closeTimer);
            closeTimer = window.setTimeout(function () {
                setOpen(false);
            }, 260);
        }

        function isInsideMenuArea(target) {
            return !!target && (trigger.contains(target) || menu.contains(target));
        }

        function openFromHover() {
            if (canHoverOpen()) setOpen(true);
        }

        if (triggerLink) {
            triggerLink.setAttribute("aria-haspopup", "true");
            triggerLink.setAttribute("aria-expanded", "false");
            triggerLink.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                setOpen(!menu.classList.contains("active"));
            }, true);
        }

        [trigger, menu].forEach(function (node) {
            node.addEventListener("mouseenter", openFromHover);
            node.addEventListener("mouseleave", function (event) {
                if (canHoverOpen() && !isInsideMenuArea(event.relatedTarget)) scheduleClose();
            });
            node.addEventListener("focusin", function () {
                setOpen(true);
            });
            node.addEventListener("focusout", function (event) {
                window.setTimeout(function () {
                    if (!isInsideMenuArea(event.relatedTarget) && !isInsideMenuArea(document.activeElement)) setOpen(false);
                }, 0);
            });
        });

        menu.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        document.addEventListener("click", function (event) {
            if (!trigger.contains(event.target) && !menu.contains(event.target)) setOpen(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") setOpen(false);
        });

        window.addEventListener("resize", function () {
            if (window.matchMedia("(min-width: 901px)").matches) trigger.classList.remove("open");
        });
    }

    function initMobileNav() {
        var button = $(".mobile-menu-btn");
        var links = $(".nav-links");
        var navIcons = $(".nav-icons");
        if (!button || !links) return;

        if (button.dataset.noirMobileNav === "ready") return;
        button.dataset.noirMobileNav = "ready";

        var sidebarId = "noirMobileSidebar";
        var backdrop = $("#noirMobileBackdrop");
        var sidebar = $("#" + sidebarId);
        var collectionsMarkup = "";
        var itemIndex = 0;

        $$(".mega-column", links).forEach(function (column, index) {
            var title = $("h4", column);
            var columnLinks = $$(".mega-links a", column).map(function (link) {
                return '<a class="noir-mobile-collection-link" href="' + escapeAttr(link.getAttribute("href") || "#") + '">' + escapeHtml(link.textContent.trim()) + '</a>';
            }).join("");
            collectionsMarkup += [
                '<div class="noir-mobile-collection-group" style="--mobile-item-index:' + index + '">',
                '<strong>' + escapeHtml(title ? title.textContent.trim() : "Collection") + '</strong>',
                '<div class="noir-mobile-collection-links">' + columnLinks + '</div>',
                '</div>'
            ].join("");
        });

        var navMarkup = $$(".nav-links > li", links).map(function (item) {
            var link = $("a", item);
            if (!link) return "";
            if (item.classList.contains("has-mega-menu")) {
                var index = itemIndex++;
                return [
                    '<div class="noir-mobile-nav-group" style="--mobile-item-index:' + index + '">',
                    '<button class="noir-mobile-collections-toggle" type="button" aria-expanded="false">',
                    '<span>Collections</span><span class="noir-mobile-accordion-symbol" aria-hidden="true">+</span>',
                    '</button>',
                    '<div class="noir-mobile-collections-panel" aria-hidden="true">' + collectionsMarkup + '</div>',
                    '</div>'
                ].join("");
            }
            var indexNumber = itemIndex++;
            return '<a class="noir-mobile-nav-link" style="--mobile-item-index:' + indexNumber + '" href="' + escapeAttr(link.getAttribute("href") || "#") + '">' + escapeHtml(link.textContent.trim()) + '</a>';
        }).join("");

        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.id = "noirMobileBackdrop";
            backdrop.className = "noir-mobile-backdrop";
            document.body.appendChild(backdrop);
        }

        if (!sidebar) {
            sidebar = document.createElement("aside");
            sidebar.id = sidebarId;
            sidebar.className = "noir-mobile-sidebar";
            sidebar.setAttribute("aria-label", "NoirAura navigation");
            sidebar.setAttribute("aria-hidden", "true");
            document.body.appendChild(sidebar);
        }

        sidebar.innerHTML = [
            '<div class="noir-mobile-sidebar-head">',
            '<a class="noir-mobile-brand" href="index.html">Noir<span>Aura</span></a>',
            '<button class="noir-mobile-close" type="button" aria-label="Close navigation"><span aria-hidden="true">&times;</span></button>',
            '</div>',
            '<button class="noir-mobile-search" type="button"><i class="fas fa-search" aria-hidden="true"></i><span>Search NoirAura</span></button>',
            '<nav class="noir-mobile-nav" aria-label="Mobile navigation">' + navMarkup + '</nav>',
            '<div class="noir-mobile-actions" aria-label="Account actions">',
            '<button type="button" data-mobile-action="orders"><i class="fas fa-shipping-fast" aria-hidden="true"></i><span>Orders</span><em data-mobile-count="orders">0</em></button>',
            '<button type="button" data-mobile-action="cart"><i class="fas fa-shopping-bag" aria-hidden="true"></i><span>Bag</span><em data-mobile-count="cart">0</em></button>',
            '<button type="button" data-mobile-action="account"><i class="fas fa-user" aria-hidden="true"></i><span>Account</span></button>',
            '</div>'
        ].join("");

        var closeButton = $(".noir-mobile-close", sidebar);
        var collectionsToggle = $(".noir-mobile-collections-toggle", sidebar);
        var collectionsPanel = $(".noir-mobile-collections-panel", sidebar);

        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-label", "Open navigation menu");
        button.setAttribute("aria-controls", sidebarId);
        button.setAttribute("aria-expanded", "false");

        function setCollections(open) {
            if (!collectionsToggle || !collectionsPanel) return;
            collectionsToggle.classList.toggle("is-open", open);
            collectionsToggle.setAttribute("aria-expanded", open ? "true" : "false");
            collectionsPanel.classList.toggle("is-open", open);
            collectionsPanel.setAttribute("aria-hidden", open ? "false" : "true");
            collectionsPanel.style.setProperty("--mobile-collections-height", open ? collectionsPanel.scrollHeight + "px" : "0px");
            var symbol = $(".noir-mobile-accordion-symbol", collectionsToggle);
            if (symbol) symbol.textContent = open ? "-" : "+";
        }

        function syncMobileActionBadges() {
            var orderBadge = $('[data-mobile-count="orders"]', sidebar);
            var cartBadge = $('[data-mobile-count="cart"]', sidebar);
            var orderSource = $("#orderCount");
            var cartSource = $("#cartCount");
            if (orderBadge && orderSource) {
                var orderValue = orderSource.textContent.trim() || "0";
                orderBadge.textContent = orderValue;
                orderBadge.classList.toggle("is-empty", orderValue === "0");
            }
            if (cartBadge && cartSource) {
                var cartValue = cartSource.textContent.trim() || "0";
                cartBadge.textContent = cartValue;
                cartBadge.classList.toggle("is-empty", cartValue === "0");
            }
        }

        function closeMenu(restoreFocus) {
            body.classList.remove("noir-mobile-nav-open");
            sidebar.classList.remove("is-open");
            backdrop.classList.remove("is-open");
            sidebar.setAttribute("aria-hidden", "true");
            button.setAttribute("aria-expanded", "false");
            button.classList.remove("is-open");
            links.classList.remove("active");
            setCollections(false);
            if (restoreFocus) button.focus();
        }

        function openMenu(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
            links.classList.remove("active");
            body.classList.add("noir-mobile-nav-open");
            sidebar.classList.add("is-open");
            backdrop.classList.add("is-open");
            sidebar.setAttribute("aria-hidden", "false");
            button.setAttribute("aria-expanded", "true");
            button.classList.add("is-open");
            syncMobileActionBadges();
            window.setTimeout(function () {
                if (closeButton) closeButton.focus();
            }, 80);
        }

        button.addEventListener("click", openMenu, true);

        button.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                openMenu(event);
            }
        }, true);

        if (collectionsToggle) {
            collectionsToggle.addEventListener("click", function () {
                setCollections(collectionsToggle.getAttribute("aria-expanded") !== "true");
            });
        }

        if (closeButton) closeButton.addEventListener("click", function () { closeMenu(true); });
        backdrop.addEventListener("click", function () { closeMenu(true); });

        $$(".noir-mobile-nav-link, .noir-mobile-collection-link", sidebar).forEach(function (link) {
            link.addEventListener("click", function () {
                closeMenu(false);
            });
        });

        $(".noir-mobile-search", sidebar).addEventListener("click", function () {
            closeMenu(false);
            window.setTimeout(function () {
                var searchTrigger = $(".noir-search-trigger");
                if (searchTrigger) searchTrigger.click();
            }, 260);
        });

        $$(".noir-mobile-actions button", sidebar).forEach(function (action) {
            action.addEventListener("click", function () {
                var selectors = {
                    orders: "#ordersIcon",
                    cart: "#cartIcon",
                    account: "#userIcon"
                };
                var target = $(selectors[action.dataset.mobileAction]);
                closeMenu(false);
                window.setTimeout(function () {
                    if (target) target.click();
                }, 220);
            });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && body.classList.contains("noir-mobile-nav-open")) closeMenu(true);
        });

        window.addEventListener("resize", function () {
            if (window.matchMedia("(min-width: 1061px)").matches) closeMenu(false);
            else if (collectionsPanel && collectionsPanel.classList.contains("is-open")) {
                collectionsPanel.style.setProperty("--mobile-collections-height", collectionsPanel.scrollHeight + "px");
            }
        }, { passive: true });

        var orderSource = $("#orderCount");
        var cartSource = $("#cartCount");
        if (orderSource) new MutationObserver(syncMobileActionBadges).observe(orderSource, { childList: true, characterData: true, subtree: true });
        if (cartSource) new MutationObserver(syncMobileActionBadges).observe(cartSource, { childList: true, characterData: true, subtree: true });
        syncMobileActionBadges();

        if (navIcons) navIcons.setAttribute("aria-label", "NoirAura account tools");
    }

    function initSectionTitles() {
        var map = [
            [/featured/i, "01 / SIGNATURE"],
            [/collection|products|best|arrival|limited|sample|gift/i, "02 / DISCOVER"],
            [/clients|reviews|experience/i, "NOIRAURA EDIT"],
            [/story|philosophy|craftsmanship|meet/i, "THE HOUSE"],
            [/contact|support|questions|help/i, "CUSTOMER CARE"],
            [/advisor|aura/i, "FIND YOUR AURA"]
        ];

        $$(".section-title, h2.section-title").forEach(function (title) {
            var text = title.textContent.trim();
            var matched = map.find(function (item) {
                return item[0].test(text);
            });
            title.setAttribute("data-noir-eyebrow", matched ? matched[1] : "NOIRAURA EDIT");
        });
    }

    function normalizeWishlistItems(items) {
        var source = Array.isArray(items) ? items : [];
        var changed = !Array.isArray(items);
        var seen = {};
        var normalized = [];

        source.forEach(function (item) {
            if (!item || typeof item !== "object") {
                changed = true;
                return;
            }

            var copy = Object.assign({}, item);
            var originalPage = copy.page;
            if (copy.page) {
                copy.page = (String(copy.page).split("/").pop() || "index.html").toLowerCase();
                if (copy.page !== originalPage) changed = true;
            }

            var id = String(copy.id || "");
            if (id.charAt(0) === ":") {
                id = "index.html" + id;
                changed = true;
            }

            var separator = id.indexOf(":");
            if (separator > 0) {
                var idPage = id.slice(0, separator);
                var normalizedPage = (idPage.split("/").pop() || "index.html").toLowerCase();
                if (idPage !== normalizedPage) {
                    id = normalizedPage + id.slice(separator);
                    changed = true;
                }
            }

            if (!id && copy.productId && copy.name) {
                id = (copy.page || "index.html") + ":" + copy.productId + ":" + copy.name;
                changed = true;
            }

            if (id !== copy.id) copy.id = id;
            if (!copy.page && id) {
                var pageSeparator = id.indexOf(":");
                copy.page = pageSeparator > 0 ? id.slice(0, pageSeparator) : "index.html";
                changed = true;
            }

            if (!copy.id || seen[copy.id]) {
                changed = true;
                return;
            }

            seen[copy.id] = true;
            normalized.push(copy);
        });

        return { items: normalized, changed: changed || normalized.length !== source.length };
    }

    function wishlistItems() {
        var normalized = normalizeWishlistItems(safeJson("noirAuraWishlist", []));
        if (normalized.changed) saveJson("noirAuraWishlist", normalized.items);
        return normalized.items;
    }

    function setWishlist(items) {
        saveJson("noirAuraWishlist", items);
        document.dispatchEvent(new CustomEvent("noiraura:wishlist-updated"));
    }

    function isSaved(id) {
        return wishlistItems().some(function (item) {
            return item.id === id;
        });
    }

    function toggleWishlist(item) {
        var items = wishlistItems();
        var existing = items.findIndex(function (saved) {
            return saved.id === item.id;
        });
        if (existing >= 0) {
            items.splice(existing, 1);
        } else {
            items.unshift(item);
        }
        setWishlist(items);
        return existing < 0;
    }

    function enhanceProductCards() {
        var label = pageLabel();

        $$(".perfume-card").forEach(function (card, index) {
            if (card.dataset.noirEnhanced === "true") return;
            card.dataset.noirEnhanced = "true";

            var title = $(".perfume-info h3", card);
            var price = $(".perfume-info p", card);
            if (!title) return;

            var profile = getProfile(title.textContent);
            var info = $(".perfume-info", card);
            var action = $(".view-details, .add-to-cart, .buy-now", card);
            var productId = action ? action.getAttribute("data-id") : String(index + 1);
            var pageKey = currentPage();
            var id = pageKey + ":" + productId + ":" + title.textContent.trim();
            var familyName = profile.family.replace(" Amber", "").replace(" Musk", "").replace(" Floral", "");
            var tags = pageProductTags();

            card.dataset.productRank = String(index);
            card.dataset.productName = title.textContent.trim();
            card.dataset.productPrice = parsePrice(price ? price.textContent : "");
            card.dataset.productFamily = familyName;
            card.dataset.productGender = /men/i.test(label) ? "Men" : /women/i.test(label) ? "Women" : "Unisex";
            card.dataset.productCategory = label;
            card.dataset.productTags = tags.join("|");
            card.dataset.searchText = productSearchText({
                name: title.textContent,
                category: label,
                collection: label,
                family: familyName,
                gender: card.dataset.productGender,
                tags: tags,
                notes: getProfileNotes(profile),
                page: currentPage()
            });

            var kicker = document.createElement("span");
            kicker.className = "card-kicker";
            kicker.textContent = /men/i.test(label) ? "For Him" : /women/i.test(label) ? "For Her" : profile.family;
            info && info.insertBefore(kicker, title);

            var family = document.createElement("div");
            family.className = "scent-family";
            family.textContent = profile.family;
            price && price.insertAdjacentElement("afterend", family);

            var noteStrip = document.createElement("div");
            noteStrip.className = "note-strip";
            [profile.notes.top[0], profile.notes.heart[0], profile.notes.base[0]].forEach(function (note) {
                var chip = document.createElement("span");
                chip.textContent = note;
                noteStrip.appendChild(chip);
            });
            family.insertAdjacentElement("afterend", noteStrip);

            var heart = document.createElement("button");
            heart.type = "button";
            heart.className = "noir-wishlist-button";
            heart.setAttribute("aria-label", "Save " + title.textContent.trim());
            heart.innerHTML = '<i class="fas fa-heart"></i>';
            heart.classList.toggle("is-saved", isSaved(id));
            heart.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (!requireCurrentUser("Please sign in or sign up before saving scents to your wishlist.")) return;
                var saved = toggleWishlist({
                    id: id,
                    productId: productId,
                    page: pageKey,
                    name: title.textContent.trim(),
                    price: price ? price.textContent.trim() : "",
                    image: imageFromCard(card),
                    family: profile.family
                });
                heart.classList.toggle("is-saved", saved);
            });
            card.appendChild(heart);
        });
    }

    function notesMarkup(profile) {
        var meters = Object.keys(profile.profile).map(function (key) {
            return [
                '<div class="profile-meter">',
                "<span>" + key + "</span>",
                '<span class="profile-meter-track"><span class="profile-meter-fill" style="width:' + profile.profile[key] + '%"></span></span>',
                "</div>"
            ].join("");
        }).join("");

        return [
            '<div class="luxury-notes-panel">',
            '<div class="notes-grid">',
            '<div class="note-group"><b>Top</b><span>' + profile.notes.top.join(" &middot; ") + "</span></div>",
            '<div class="note-group"><b>Heart</b><span>' + profile.notes.heart.join(" &middot; ") + "</span></div>",
            '<div class="note-group"><b>Base</b><span>' + profile.notes.base.join(" &middot; ") + "</span></div>",
            "</div>",
            '<div class="profile-meters">' + meters + "</div>",
            "</div>"
        ].join("");
    }

    function enhanceProductModal() {
        var modal = $("#productModal");
        var title = $("#productModalTitle");
        var description = $("#productModalDescription");
        var image = $("#productModalImage");
        if (!modal || !title || !description) return;

        function refresh() {
            var productName = title.textContent.trim();
            if (!productName || productName === "Product Name") return;
            var existing = $(".luxury-notes-panel", modal);
            if (existing) existing.remove();
            description.insertAdjacentHTML("afterend", notesMarkup(getProfile(productName)));
            var notesPanel = $(".luxury-notes-panel", modal);
            if (notesPanel) {
                notesPanel.classList.add("noir-modal-notes-reveal");
                $$(".note-group, .profile-meter", notesPanel).forEach(function (item, index) {
                    item.classList.add("noir-product-note-reveal");
                    item.style.setProperty("--note-delay", 90 + index * 55 + "ms");
                });
            }

            if (image) {
                image.setAttribute("role", "img");
                image.setAttribute("aria-label", productName);
                image.classList.add("noir-modal-product-reveal");
                var imageMatches = Array.prototype.slice.call(image.style.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g));
                if (imageMatches.length) {
                    var productImageUrl = imageMatches[imageMatches.length - 1][1].replace(/"/g, "%22");
                    image.style.backgroundImage = 'url("' + productImageUrl + '")';
                }
                image.style.backgroundSize = "contain";
                image.style.backgroundRepeat = "no-repeat";
                image.style.backgroundPosition = "center";
                image.style.filter = "none";
            }
        }

        var observer = new MutationObserver(refresh);
        observer.observe(title, { childList: true, characterData: true, subtree: true });
        observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
    }

    function initAuraFinder() {
        var section = $(".find-aura");
        if (!section) return;

        var result = $("#auraResult");
        var choices = $$(".aura-choice", section);
        var recommendations = {
            mysterious: {
                aura: "Mysterious",
                scent: "Royal Oud",
                family: "Woody Amber Musk",
                notes: ["Oud", "Amber", "Musk"],
                href: "index.html"
            },
            romantic: {
                aura: "Romantic",
                scent: "Velvet Orchid",
                family: "Floral Vanilla",
                notes: ["Orchid", "Rose", "Vanilla"],
                href: "index.html"
            },
            fresh: {
                aura: "Fresh",
                scent: "Lost Light Body Mist",
                family: "Citrus Musk",
                notes: ["Bergamot", "Tea", "Cedar"],
                href: "men2.html"
            },
            warm: {
                aura: "Warm",
                scent: "Amber Noir",
                family: "Amber Spice",
                notes: ["Plum", "Amber", "Tonka"],
                href: "index.html"
            }
        };

        function render(key) {
            var recommendation = recommendations[key];
            if (!recommendation || !result) return;
            choices.forEach(function (choice) {
                choice.classList.toggle("is-active", choice.dataset.aura === key);
            });
            result.innerHTML = [
                '<span class="luxury-eyebrow">Your Aura</span>',
                "<h3>" + recommendation.aura + "</h3>",
                "<p><strong>" + recommendation.scent + "</strong><br>" + recommendation.family + "</p>",
                '<div class="aura-notes">' + recommendation.notes.map(function (note) {
                    return "<span>" + note + "</span>";
                }).join("") + "</div>",
                '<a class="aura-result-link" href="' + recommendation.href + '">Discover This Scent</a>'
            ].join("");
        }

        choices.forEach(function (choice) {
            choice.addEventListener("click", function () {
                render(choice.dataset.aura);
            });
        });

        render("mysterious");
    }

    function initAccountRouting() {
        var userIcon = $("#userIcon");
        if (!userIcon || body.dataset.page === "dashboard") return;

        userIcon.setAttribute("title", "My Aura");
        userIcon.addEventListener("click", function (event) {
            if (currentUser()) {
                event.preventDefault();
                event.stopImmediatePropagation();
                window.location.href = "dashboard.html";
            }
        }, true);
    }

    function initPasswordToggles() {
        $$('input[type="password"]').forEach(function (input) {
            var group = input.closest(".form-group") || input.parentElement;
            if (!group || $(".password-toggle", group)) return;
            group.classList.add("has-password-toggle");
            var button = document.createElement("button");
            button.type = "button";
            button.className = "password-toggle";
            button.setAttribute("aria-label", "Show password");
            button.innerHTML = '<i class="fas fa-eye"></i>';
            button.addEventListener("click", function () {
                var showing = input.type === "text";
                input.type = showing ? "password" : "text";
                button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
                button.innerHTML = showing ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
            input.insertAdjacentElement("afterend", button);
        });
    }

    function ensureAuthModal() {
        var existing = $("#authModal");
        if (existing) return existing;

        var modal = document.createElement("div");
        modal.className = "modal";
        modal.id = "authModal";
        modal.innerHTML = [
            '<div class="modal-content">',
            '<span class="close-modal" id="closeModal">&times;</span>',
            '<div class="modal-tabs">',
            '<button class="tab-btn active" type="button" data-tab="login">Login</button>',
            '<button class="tab-btn" type="button" data-tab="signup">Sign Up</button>',
            '</div>',
            '<div class="tab-content active" id="loginTab">',
            '<form id="loginForm">',
            '<div class="form-group"><label for="loginEmail">Email</label><input type="email" id="loginEmail" required></div>',
            '<div class="form-group"><label for="loginPassword">Password</label><input type="password" id="loginPassword" required></div>',
            '<div class="form-options"><div class="remember-me"><input type="checkbox" id="rememberMe"><label for="rememberMe">Remember me</label></div><a href="#" class="forgot-password">Forgot password?</a></div>',
            '<button type="submit" class="submit-btn">Login</button>',
            '</form>',
            '</div>',
            '<div class="tab-content" id="signupTab">',
            '<form id="signupForm">',
            '<div class="form-group"><label for="signupName">Full Name</label><input type="text" id="signupName" required></div>',
            '<div class="form-group"><label for="signupEmail">Email</label><input type="email" id="signupEmail" required></div>',
            '<div class="form-group"><label for="signupPassword">Password</label><input type="password" id="signupPassword" required></div>',
            '<div class="form-group"><label for="confirmPassword">Confirm Password</label><input type="password" id="confirmPassword" required></div>',
            '<div class="form-group"><label for="signupZipCode">Postal Code</label><input type="text" id="signupZipCode" placeholder="e.g. 54000" required></div>',
            '<button type="submit" class="submit-btn">Sign Up</button>',
            '</form>',
            '</div>',
            '</div>'
        ].join("");
        document.body.appendChild(modal);
        return modal;
    }

    function showAuthTab(tabName) {
        var modal = ensureAuthModal();
        var normalized = tabName === "signup" ? "signup" : "login";
        $$(".tab-btn", modal).forEach(function (button) {
            button.classList.toggle("active", button.dataset.tab === normalized);
        });
        $$(".tab-content", modal).forEach(function (content) {
            content.classList.toggle("active", content.id === normalized + "Tab");
        });
    }

    function authMessage(form, message, tone) {
        if (!form) return;
        var node = $(".auth-message", form);
        if (!node) {
            node = document.createElement("p");
            node.className = "auth-message";
            form.insertBefore(node, form.firstChild);
        }
        node.className = "auth-message " + (tone || "error");
        node.textContent = message || "";
    }

    function openAuthModal(message, tabName) {
        var modal = ensureAuthModal();
        showAuthTab(tabName || "login");
        modal.classList.add("active", "auth-modal");
        body.classList.add("noir-auth-open");
        if (message) {
            var form = $("#" + (tabName === "signup" ? "signupForm" : "loginForm"), modal);
            authMessage(form, message, "error");
        }
        setTimeout(function () {
            var field = $("#" + (tabName === "signup" ? "signupName" : "loginEmail"), modal);
            if (field) {
                try {
                    field.focus({ preventScroll: true });
                } catch (error) {
                    field.focus();
                }
            }
        }, 80);
    }

    function closeAuthModal() {
        var modal = $("#authModal");
        if (!modal) return;
        modal.classList.remove("active");
        body.classList.remove("noir-auth-open");
    }

    function prepareAuthForms() {
        var modal = $("#authModal") || (body.dataset.page === "dashboard" ? ensureAuthModal() : null);
        if (!modal) return;
        modal.classList.add("auth-modal");

        var content = $(".modal-content", modal);
        if (content && !$(".auth-brand-header", content)) {
            var close = $(".close-modal", content);
            var headerMarkup = '<div class="auth-brand-header"><span class="luxury-eyebrow">My Aura</span><h2>NoirAura Account</h2></div>';
            if (close) close.insertAdjacentHTML("afterend", headerMarkup);
            else content.insertAdjacentHTML("afterbegin", headerMarkup);
        }

        [
            ["#loginEmail", "email", "email", "254"],
            ["#signupEmail", "email", "email", "254"],
            ["#loginPassword", "current-password", "password", "64"],
            ["#signupPassword", "new-password", "password", "64"],
            ["#confirmPassword", "new-password", "password", "64"],
            ["#signupName", "name", "text", "80"],
            ["#signupZipCode", "postal-code", "text", "16"]
        ].forEach(function (item) {
            var input = $(item[0], modal);
            if (!input) return;
            input.setAttribute("autocomplete", item[1]);
            input.setAttribute("type", item[2]);
            input.setAttribute("maxlength", item[3]);
            if (item[0].indexOf("Password") >= 0) input.setAttribute("minlength", "8");
        });

        var signupPassword = $("#signupPassword", modal);
        var passwordGroup = signupPassword && signupPassword.closest(".form-group");
        if (passwordGroup && !$(".auth-password-rules", passwordGroup.parentElement)) {
            passwordGroup.insertAdjacentHTML("afterend", '<p class="auth-password-rules">Use 8-64 characters with uppercase, lowercase, and a number.</p>');
        }

        initPasswordToggles();
    }

    function handleAuthSubmit(event) {
        var form = event.target;
        if (!form || (form.id !== "loginForm" && form.id !== "signupForm")) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        if (form.id === "loginForm") {
            var loginResult = loginAccount($("#loginEmail").value, $("#loginPassword").value);
            authMessage(form, loginResult.message, loginResult.ok ? "success" : "error");
            if (loginResult.ok) {
                form.reset();
                setTimeout(closeAuthModal, 360);
            }
            return;
        }

        var signupResult = createAccount({
            name: $("#signupName").value,
            email: $("#signupEmail").value,
            password: $("#signupPassword").value,
            confirmPassword: $("#confirmPassword").value,
            zipCode: $("#signupZipCode").value
        });
        authMessage(form, signupResult.message, signupResult.ok ? "success" : "error");
        if (signupResult.ok) {
            form.reset();
            setTimeout(closeAuthModal, 420);
        }
    }

    function requireCurrentUser(message) {
        if (currentUser()) return true;
        openAuthModal(message || "Please log in or sign up to continue.", "login");
        return false;
    }

    function renderCartChrome() {
        var user = currentUser();
        var cart = user ? readUserData("noirAuraCart", []) : [];
        var count = cart.reduce(function (sum, item) { return sum + Number(item.quantity || 0); }, 0);
        var total = cart.reduce(function (sum, item) { return sum + Number(item.price || 0) * Number(item.quantity || 0); }, 0);
        var countNode = $("#cartCount");
        var totalNode = $("#cartTotal");
        var itemsNode = $("#cartItems");

        if (countNode) countNode.textContent = count;
        if (totalNode) totalNode.textContent = "PKR " + total.toLocaleString();
        if (!itemsNode) return;

        if (!cart.length) {
            itemsNode.innerHTML = '<p class="noir-empty-state">Your cart is empty.</p>';
            return;
        }

        itemsNode.innerHTML = cart.map(function (item, index) {
            return [
                '<div class="cart-item">',
                '<div class="cart-item-img" style="background-image:url(\'' + escapeAttr(item.image || "") + '\')"></div>',
                '<div class="cart-item-details">',
                '<h4>' + escapeHtml(item.name) + '</h4>',
                '<p>PKR ' + Number(item.price || 0).toLocaleString() + '</p>',
                '<div class="cart-item-controls">',
                '<button class="quantity-btn minus" type="button" data-user-cart-index="' + index + '">-</button>',
                '<span>' + Number(item.quantity || 0) + '</span>',
                '<button class="quantity-btn plus" type="button" data-user-cart-index="' + index + '">+</button>',
                '<span class="remove-item" role="button" tabindex="0" data-user-cart-index="' + index + '">Remove</span>',
                '</div>',
                '</div>',
                '</div>'
            ].join("");
        }).join("");
    }

    function adjustUserCart(index, change) {
        var cart = readUserData("noirAuraCart", []);
        if (!cart[index]) return;
        if (change === "remove") cart.splice(index, 1);
        else {
            cart[index].quantity = Number(cart[index].quantity || 1) + change;
            if (cart[index].quantity < 1) cart.splice(index, 1);
        }
        saveUserData("noirAuraCart", cart);
        renderCartChrome();
        announceUserDataChange();
    }

    function syncWishlistButtons() {
        $$(".noir-wishlist-button").forEach(function (button) {
            var card = button.closest(".perfume-card");
            if (!card) return;
            var title = $(".perfume-info h3", card);
            var action = $(".view-details, .add-to-cart, .buy-now", card);
            var productId = action ? action.getAttribute("data-id") : "";
            var id = currentPage() + ":" + productId + ":" + (title ? title.textContent.trim() : "");
            button.classList.toggle("is-saved", !!currentUser() && isSaved(id));
        });
    }

    function renderProfileModalChrome(user) {
        if (!user) return;
        var name = displayName(user);
        [
            ["#profileUsername", name],
            ["#profileEmail", user.email || ""],
            ["#profileFullName", name],
            ["#profileEmailValue", user.email || ""],
            ["#profileZipCode", profileZip(user)]
        ].forEach(function (item) {
            var node = $(item[0]);
            if (node) node.textContent = item[1];
        });
        var avatar = $("#profileAvatar");
        if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
    }

    function syncAccountChrome() {
        var user = currentUser();
        var greeting = $("#userGreeting");
        if (greeting) greeting.textContent = user ? "Hello, " + displayName(user) : "";
        var orderCount = $("#orderCount");
        if (orderCount) orderCount.textContent = user ? readUserData("noirAuraOrders", []).length : 0;
        renderCartChrome();
        syncWishlistButtons();
        renderProfileModalChrome(user);
    }

    function prefillCheckoutForm() {
        var user = currentUser();
        if (!user) return;
        [
            ["#fullName", displayName(user)],
            ["#email", user.email || ""],
            ["#phone", user.phone || ""],
            ["#address", user.address || ""],
            ["#city", user.city || ""],
            ["#zipCode", profileZip(user)]
        ].forEach(function (item) {
            var input = $(item[0]);
            if (input && !input.value) input.value = item[1];
        });
    }

    function paymentMethodInfo(method) {
        if (method === "paypal") {
            return {
                name: "PayPal",
                note: "Fast and secure checkout",
                visual: '<span class="payment-card-logo payment-card-logo-paypal" aria-hidden="true"><span>P</span></span>'
            };
        }

        return {
            name: "Credit / Debit Card",
            note: "Pay securely with your card",
            visual: '<span class="payment-card-logo payment-card-logo-mastercard" aria-hidden="true"><span class="mc-circle mc-red"></span><span class="mc-circle mc-gold"></span><span class="payment-logo-text">MC</span></span>'
        };
    }

    function paymentMethodName(method) {
        var normalized = normalizeText(method || "credit");
        return normalized === "paypal" ? "paypal" : "credit";
    }

    function paymentCardFields(form) {
        return ["#cardNumber", "#cvv", "#cardName"].map(function (selector) {
            var input = $(selector, form);
            return input ? input.closest(".form-group") : null;
        }).filter(Boolean);
    }

    function setCardFieldAvailability(form, isCardSelected) {
        paymentCardFields(form).forEach(function (group) {
            var input = $("input, textarea, select", group);
            group.classList.add("payment-card-field");
            group.classList.toggle("is-hidden", !isCardSelected);
            group.setAttribute("aria-hidden", isCardSelected ? "false" : "true");
            if (!input) return;
            if (!input.dataset.originalRequired) input.dataset.originalRequired = input.required ? "true" : "false";
            input.disabled = !isCardSelected;
            input.required = isCardSelected && input.dataset.originalRequired === "true";
        });
    }

    function selectedPaymentMethod(form) {
        var checked = $('input[name="payment"]:checked, input[name="paymentMethod"]:checked', form);
        if (checked && checked.closest(".payment-method")) return paymentMethodName(checked.closest(".payment-method").dataset.method);
        var selected = $(".payment-method.selected", form);
        return paymentMethodName(selected && selected.dataset.method);
    }

    function selectPaymentMethod(card, form) {
        var method = paymentMethodName(card.dataset.method);
        $$(".payment-method", form).forEach(function (item) {
            var itemMethod = paymentMethodName(item.dataset.method);
            var isSelected = item === card;
            item.classList.toggle("selected", isSelected);
            item.setAttribute("aria-checked", isSelected ? "true" : "false");
            item.tabIndex = isSelected ? 0 : -1;
            var input = $('input[type="radio"]', item);
            if (input) {
                input.checked = isSelected;
                input.value = itemMethod;
            }
        });
        setCardFieldAvailability(form, method === "credit");
    }

    function enhancePaymentCard(card, index, form) {
        var method = paymentMethodName(card.dataset.method);
        card.dataset.method = method;
        card.classList.add("noir-payment-card");
        card.setAttribute("role", "radio");
        var input = $('input[type="radio"]', card);
        if (!input) {
            input = document.createElement("input");
            input.type = "radio";
            card.prepend(input);
        }
        input.name = input.name || "payment";
        input.value = method;
        input.id = method === "paypal" ? "paypal" : "creditCard";
        input.checked = card.classList.contains("selected") || input.checked || (method === "credit" && !$('input[type="radio"]:checked', form));
        var info = paymentMethodInfo(method);
        card.innerHTML = [
            input.outerHTML,
            '<span class="payment-card-visual">' + info.visual + '</span>',
            '<label class="payment-card-copy" for="' + escapeAttr(input.id) + '"><strong>' + info.name + '</strong><small>' + info.note + '</small></label>',
            '<span class="payment-select-indicator" aria-hidden="true"></span>'
        ].join("");
        var freshInput = $('input[type="radio"]', card);
        freshInput.checked = input.checked;
        freshInput.value = method;
        if (input.checked) card.classList.add("selected");
        card.tabIndex = input.checked ? 0 : -1;
        card.setAttribute("aria-checked", input.checked ? "true" : "false");
        card.setAttribute("aria-label", info.name + ". " + info.note);
    }

    function initLuxuryPaymentMethods() {
        $$(".payment-methods").forEach(function (container) {
            var form = container.closest("#paymentForm") || container.closest(".checkout-form") || document;
            var seen = {};
            $$(".payment-method", container).forEach(function (card) {
                var method = paymentMethodName(card.dataset.method);
                if (seen[method]) {
                    card.remove();
                    return;
                }
                seen[method] = true;
            });
            $$(".payment-method", container).forEach(function (card, index) {
                if (!card.classList.contains("noir-payment-card")) enhancePaymentCard(card, index, form);
            });
            var selected = $('input[type="radio"]:checked', container);
            var selectedCard = selected ? selected.closest(".payment-method") : $(".payment-method", container);
            if (selectedCard) selectPaymentMethod(selectedCard, form);
            if (container.dataset.noirPaymentReady) return;
            container.dataset.noirPaymentReady = "true";
            container.addEventListener("click", function (event) {
                var card = event.target.closest(".payment-method");
                if (!card || !container.contains(card)) return;
                selectPaymentMethod(card, form);
            });
            container.addEventListener("keydown", function (event) {
                var card = event.target.closest(".payment-method");
                if (!card || (event.key !== "Enter" && event.key !== " ")) return;
                event.preventDefault();
                selectPaymentMethod(card, form);
            });
            container.addEventListener("change", function (event) {
                var input = event.target;
                if (!input.matches('input[type="radio"]')) return;
                var card = input.closest(".payment-method");
                if (card) selectPaymentMethod(card, form);
            });
        });
    }

    function completePayPalCheckout(event) {
        var button = event.target.closest && event.target.closest("#placeOrder");
        if (!button) return;
        var form = button.closest("#paymentForm") || $("#paymentForm");
        if (!form || selectedPaymentMethod(form) !== "paypal") return;

        event.preventDefault();
        event.stopImmediatePropagation();

        var orderId = "#NOIR-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
        var orderIdNode = $("#orderId");
        if (orderIdNode) orderIdNode.textContent = orderId;
        if (typeof window.saveOrder === "function") window.saveOrder(orderId);
        if (typeof window.setActiveStep === "function") window.setActiveStep(3);
        else $$(".step").forEach(function (step) {
            step.classList.toggle("active", Number(step.getAttribute("data-step")) === 3);
        });
        if (typeof window.setActiveForm === "function") window.setActiveForm("confirmation");
        else $$(".checkout-form").forEach(function (checkoutForm) {
            checkoutForm.classList.toggle("active", checkoutForm.id === "confirmation");
        });
        localStorage.removeItem("noirAuraCart");
        if (typeof window.updateCartDisplay === "function") window.updateCartDisplay();
        if (typeof window.updateOrderCount === "function") window.updateOrderCount();
        syncAccountChrome();
    }

    function closeAccountModals() {
        ["#profileModal", "#ordersModal", "#cartModal"].forEach(function (selector) {
            var modal = $(selector);
            if (modal) modal.classList.remove("active");
        });
    }

    function handleAccountClick(event) {
        var target = event.target;
        var logout = target.closest && target.closest("#logoutBtn, #dashboardLogout");
        if (logout) {
            event.preventDefault();
            event.stopImmediatePropagation();
            clearCurrentUser();
            closeAccountModals();
            syncAccountChrome();
            if (body.dataset.page === "dashboard") {
                window.location.href = "index.html";
            } else {
                openAuthModal("You have been logged out. Sign in to continue.", "login");
            }
            return;
        }

        var cartControl = target.closest && target.closest("[data-user-cart-index]");
        if (cartControl) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var cartIndex = Number(cartControl.getAttribute("data-user-cart-index"));
            if (cartControl.classList.contains("plus")) adjustUserCart(cartIndex, 1);
            else if (cartControl.classList.contains("minus")) adjustUserCart(cartIndex, -1);
            else adjustUserCart(cartIndex, "remove");
            return;
        }

        var userIcon = target.closest && target.closest("#userIcon");
        if (userIcon) {
            if (!requireCurrentUser("Please sign in to open your My Aura dashboard.")) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            if (body.dataset.page !== "dashboard") {
                event.preventDefault();
                event.stopImmediatePropagation();
                window.location.href = "dashboard.html";
            }
            return;
        }

        var guarded = target.closest && target.closest(".add-to-cart, .buy-now, #addToCartFromModal, #buyNowFromModal, #checkoutBtn, #ordersIcon, #cartIcon, .noir-wishlist-button");
        if (guarded && !requireCurrentUser("Please sign in or sign up before using your bag, wishlist, orders, or checkout.")) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }

        if (guarded && guarded.id === "checkoutBtn") {
            setTimeout(prefillCheckoutForm, 60);
        }
    }

    function initAuthExperience() {
        prepareAuthForms();
        document.addEventListener("submit", handleAuthSubmit, true);
        document.addEventListener("click", function (event) {
            var tab = event.target.closest && event.target.closest(".tab-btn[data-tab]");
            if (tab && tab.closest("#authModal")) {
                event.preventDefault();
                showAuthTab(tab.dataset.tab);
            }
            var close = event.target.closest && event.target.closest("#closeModal");
            if (close && close.closest("#authModal")) {
                event.preventDefault();
                closeAuthModal();
            }
            if (event.target === $("#authModal")) closeAuthModal();
        }, true);
        document.addEventListener("click", handleAccountClick, true);
        document.addEventListener("noiraura:session-changed", function () {
            prepareAuthForms();
            syncAccountChrome();
        });
        document.addEventListener("noiraura:user-data-updated", syncAccountChrome);
        syncAccountChrome();
        setTimeout(function () {
            if (currentUser()) closeAuthModal();
        }, 1250);
    }

    function itemRank(item) {
        return Number.isFinite(Number(item.rank)) ? Number(item.rank) : Number.isFinite(Number(item.productRank)) ? Number(item.productRank) : 0;
    }

    function tagScore(item, pattern) {
        var text = [splitTags(item.tags).join(" "), item.category, item.collection, item.page].join(" ");
        return pattern.test(text) ? 1 : 0;
    }

    function featuredScore(item) {
        return tagScore(item, /Best Rated|bestse/i) * 8 +
            tagScore(item, /Trending/i) * 4 +
            tagScore(item, /Featured/i) * 2 +
            tagScore(item, /Limited|New|Gift Set|Sample Set|limi|new|gif|sam/i);
    }

    function trendingScore(item) {
        return tagScore(item, /Trending|Best Rated|bestse/i) * 3 +
            tagScore(item, /Featured|Limited|New/i);
    }

    function newestScore(item) {
        return tagScore(item, /New|new\.html/i) * 4 +
            tagScore(item, /Limited|limi\.html/i) * 2;
    }

    function sortProducts(items, sortMode) {
        var sorted = items.slice();
        var byRank = function (a, b) { return itemRank(a) - itemRank(b); };
        var byName = function (a, b) { return String(a.name || "").localeCompare(String(b.name || "")); };
        if (sortMode === "price-asc") sorted.sort(function (a, b) { return a.price - b.price || byName(a, b); });
        else if (sortMode === "price-desc") sorted.sort(function (a, b) { return b.price - a.price || byName(a, b); });
        else if (sortMode === "name-asc") sorted.sort(byName);
        else if (sortMode === "newest") sorted.sort(function (a, b) { return newestScore(b) - newestScore(a) || byRank(a, b) || byName(a, b); });
        else if (sortMode === "trending") sorted.sort(function (a, b) { return trendingScore(b) - trendingScore(a) || byRank(a, b) || byName(a, b); });
        else sorted.sort(function (a, b) { return featuredScore(b) - featuredScore(a) || byRank(a, b) || byName(a, b); });
        return sorted;
    }

    function initSearch() {
        var navIcons = $(".nav-icons");
        if (!navIcons || $(".noir-search-trigger")) return;

        var trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "noir-search-trigger";
        trigger.setAttribute("aria-label", "Search NoirAura");
        trigger.setAttribute("aria-expanded", "false");
        trigger.innerHTML = '<i class="fas fa-search"></i>';
        navIcons.insertBefore(trigger, navIcons.firstChild);

        var overlay = document.createElement("div");
        overlay.className = "noir-search-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Search NoirAura products");
        overlay.innerHTML = [
            '<div class="noir-search-panel">',
            '<div class="noir-search-head"><div><span class="luxury-eyebrow">NoirAura Search</span><h2>Find a Scent</h2></div><button class="noir-search-close" type="button" aria-label="Close search">&times;</button></div>',
            '<div class="noir-search-body">',
            '<div class="noir-search-tools">',
            '<div class="noir-search-input-wrap"><i class="fas fa-search"></i><input class="noir-search-input" type="search" placeholder="Search Oud, Midnight, Floral, Amber, Men..." autocomplete="off"></div>',
            '<select class="noir-search-sort" aria-label="Sort search results"><option value="featured">Featured</option><option value="trending">Trending</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name A-Z</option></select>',
            '<button class="noir-search-clear" type="button">Clear</button>',
            '</div>',
            '<div class="noir-search-suggestions" aria-label="Popular searches"><button type="button" data-query="Oud">Oud</button><button type="button" data-query="Amber">Amber</button><button type="button" data-query="Floral">Floral</button><button type="button" data-query="Midnight">Midnight</button><button type="button" data-query="Gift Set">Gift Set</button></div>',
            '<div class="noir-search-meta">Featured NoirAura scents</div>',
            '<div class="noir-search-results"></div>',
            '</div>',
            '</div>'
        ].join("");
        document.body.appendChild(overlay);

        var input = $(".noir-search-input", overlay);
        var sort = $(".noir-search-sort", overlay);
        var clear = $(".noir-search-clear", overlay);
        var close = $(".noir-search-close", overlay);
        var results = $(".noir-search-results", overlay);
        var meta = $(".noir-search-meta", overlay);
        var index = getSearchIndex();

        function open() {
            overlay.classList.add("is-open");
            trigger.classList.add("is-active");
            trigger.setAttribute("aria-expanded", "true");
            body.classList.add("noir-search-open");
            setTimeout(function () { input.focus(); }, 60);
            render();
        }

        function closeSearch() {
            overlay.classList.remove("is-open");
            trigger.classList.remove("is-active");
            trigger.setAttribute("aria-expanded", "false");
            body.classList.remove("noir-search-open");
            trigger.focus();
        }

        function resultMarkup(item, position) {
            var notes = (item.notes || []).slice(0, 3).map(escapeHtml).join(" - ");
            var metadata = [item.collection || item.category, item.family, item.gender].filter(Boolean).map(escapeHtml).join(" - ");
            var tags = splitTags(item.tags).slice(0, 2).map(escapeHtml).join(" / ");
            return [
                '<a class="noir-search-result" href="' + escapeAttr(productDetailUrl(item)) + '" data-product-id="' + escapeAttr(item.productId) + '" style="--result-index:' + position + '">',
                '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.name) + '">',
                '<div class="noir-search-result-copy"><span>' + (tags || "NoirAura") + '</span><h3>' + escapeHtml(item.name) + '</h3><p>' + metadata + '</p><p>' + notes + '</p></div>',
                '<strong>' + escapeHtml(item.priceText) + '</strong>',
                '</a>'
            ].join("");
        }

        function render() {
            var query = normalizeText(input.value);
            var terms = query.split(" ").filter(Boolean);
            var pool = terms.length ? index.filter(function (item) {
                return terms.every(function (term) { return item.searchText.indexOf(term) >= 0; });
            }) : index.filter(function (item) {
                return hasProductSignal(item, /Trending|Best Rated|Featured|New|Limited|bestse|new\.html|limi\.html/i);
            });
            if (!pool.length && !terms.length) pool = index.slice(0, 12);
            var sortedMatches = sortProducts(pool, sort.value);
            if (terms.length && ["featured", "trending", "newest"].indexOf(sort.value) >= 0) {
                sortedMatches.sort(function (a, b) {
                    return searchRelevance(b, query, terms) - searchRelevance(a, query, terms);
                });
            }
            var shownMatches = sortedMatches.slice(0, terms.length ? 24 : 10);
            meta.textContent = terms.length ? sortedMatches.length + " matching scents" : "Featured NoirAura scents";
            if (!shownMatches.length) {
                results.innerHTML = '<div class="noir-empty-state noir-search-empty"><strong>No scents found for your search.</strong><span>Try searching by name, fragrance family, or note.</span></div>';
                return;
            }
            results.innerHTML = shownMatches.map(resultMarkup).join("");
        }

        trigger.addEventListener("click", open);
        close.addEventListener("click", closeSearch);
        clear.addEventListener("click", function () {
            input.value = "";
            sort.value = "featured";
            render();
            input.focus();
        });
        input.addEventListener("input", render);
        sort.addEventListener("change", render);
        $$(".noir-search-suggestions button", overlay).forEach(function (button) {
            button.addEventListener("click", function () {
                input.value = button.dataset.query || "";
                render();
                input.focus();
            });
        });
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeSearch();
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && overlay.classList.contains("is-open")) closeSearch();
            if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !/input|textarea|select/i.test(document.activeElement.tagName)) {
                event.preventDefault();
                open();
            }
        });
    }

    function initCollectionFilters() {
        var filterPages = ["bestse.html", "sam.html", "gif.html", "new.html", "limi.html"];
        if (filterPages.indexOf(currentPage()) === -1) return;

        var grid = $(".products-grid");
        if (!grid || $(".noir-filter-bar")) return;
        var cards = $$(".perfume-card", grid);
        if (!cards.length) return;

        var families = Array.from(new Set(cards.map(function (card) { return card.dataset.productFamily; }).filter(Boolean))).sort();
        var genders = Array.from(new Set(cards.map(function (card) { return card.dataset.productGender; }).filter(Boolean))).sort();
        var tags = Array.from(new Set(cards.reduce(function (all, card) {
            return all.concat(splitTags(card.dataset.productTags));
        }, []))).sort();

        var bar = document.createElement("div");
        bar.className = "noir-filter-bar";
        bar.innerHTML = [
            '<button class="noir-filter-toggle" type="button"><i class="fas fa-sliders-h"></i> Filter</button>',
            '<div class="noir-filter-controls">',
            '<span class="noir-filter-label"><i class="fas fa-sliders-h"></i> Refine</span>',
            '<select class="noir-filter-select noir-filter-sort" aria-label="Sort products"><option value="featured">Featured</option><option value="trending">Trending</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name A-Z</option></select>',
            '<select class="noir-filter-select noir-filter-price" aria-label="Price range"><option value="all">All prices</option><option value="under-15000">Under PKR 15,000</option><option value="15000-25000">PKR 15,000-25,000</option><option value="25000-35000">PKR 25,000-35,000</option><option value="35000-plus">PKR 35,000+</option></select>',
            '<div class="noir-filter-chip-group noir-family-chips"></div>',
            '<div class="noir-filter-chip-group noir-gender-chips"></div>',
            '<div class="noir-filter-chip-group noir-tag-chips"></div>',
            '<button class="noir-filter-clear" type="button">Clear Filters</button>',
            '<span class="noir-filter-meta"></span>',
            '</div>'
        ].join("");
        grid.parentNode.insertBefore(bar, grid);

        function renderChips(rootSelector, values, prefix) {
            var root = $(rootSelector, bar);
            if (!root || values.length < 2) return;
            root.innerHTML = values.map(function (value) {
                return '<button class="noir-filter-chip" type="button" data-filter="' + prefix + '" data-value="' + value + '">' + value + '</button>';
            }).join("");
        }

        renderChips(".noir-family-chips", families, "family");
        renderChips(".noir-gender-chips", genders, "gender");
        renderChips(".noir-tag-chips", tags, "tag");

        var state = { family: "", gender: "", tag: "" };
        var sortSelect = $(".noir-filter-sort", bar);
        var priceSelect = $(".noir-filter-price", bar);
        var meta = $(".noir-filter-meta", bar);
        var toggle = $(".noir-filter-toggle", bar);
        var clear = $(".noir-filter-clear", bar);
        var controls = $(".noir-filter-controls", bar);
        var controlsAnchor = document.createComment("noirFilterControlsAnchor");
        var mobileFilters = window.matchMedia("(max-width: 1060px)");
        var customSelects = [];

        if (controls) controls.parentNode.insertBefore(controlsAnchor, controls);

        function priceMatches(price, band) {
            if (band === "under-15000") return price < 15000;
            if (band === "15000-25000") return price >= 15000 && price <= 25000;
            if (band === "25000-35000") return price > 25000 && price <= 35000;
            if (band === "35000-plus") return price > 35000;
            return true;
        }

        function cardItem(card) {
            return {
                card: card,
                name: card.dataset.productName || "",
                price: Number(card.dataset.productPrice || 0),
                priceText: $(".perfume-info p", card) ? $(".perfume-info p", card).textContent.trim() : "",
                page: currentPage(),
                rank: Number(card.dataset.productRank || 0),
                tags: splitTags(card.dataset.productTags),
                searchText: card.dataset.searchText || ""
            };
        }

        function applyFilters() {
            var items = cards.map(cardItem);
            var visible = items.filter(function (item) {
                var card = item.card;
                var matchesFamily = !state.family || card.dataset.productFamily === state.family;
                var matchesGender = !state.gender || card.dataset.productGender === state.gender;
                var matchesTag = !state.tag || item.tags.indexOf(state.tag) >= 0;
                var matchesPrice = priceMatches(item.price, priceSelect.value);
                return matchesFamily && matchesGender && matchesTag && matchesPrice;
            });

            var sortedVisible = sortProducts(visible, sortSelect.value);
            var ordered = sortedVisible.concat(items.filter(function (item) { return visible.indexOf(item) === -1; }));
            grid.classList.add("is-filtering");
            ordered.forEach(function (item) {
                grid.appendChild(item.card);
                item.card.classList.toggle("hidden-by-filter", visible.indexOf(item) === -1);
            });
            meta.textContent = visible.length + " of " + cards.length + " scents";
            setTimeout(function () { grid.classList.remove("is-filtering"); }, 260);
            var empty = $(".noir-filter-empty", grid.parentNode);
            if (!visible.length && !empty) {
                grid.insertAdjacentHTML("beforebegin", '<div class="noir-empty-state noir-filter-empty">No scents match these filters.</div>');
            } else if (visible.length && empty) {
                empty.remove();
            }
        }

        $$(".noir-filter-chip", bar).forEach(function (chip) {
            chip.addEventListener("click", function () {
                var type = chip.dataset.filter;
                var value = chip.dataset.value;
                state[type] = state[type] === value ? "" : value;
                $$('.noir-filter-chip[data-filter="' + type + '"]', controls || bar).forEach(function (other) {
                    other.classList.toggle("is-active", state[type] === other.dataset.value);
                });
                applyFilters();
            });
        });

        [sortSelect, priceSelect].forEach(function (control) {
            control.addEventListener("change", applyFilters);
        });

        function closeCustomSelects(except) {
            customSelects.forEach(function (entry) {
                if (entry.wrapper === except) return;
                entry.wrapper.classList.remove("is-open");
                entry.button.setAttribute("aria-expanded", "false");
            });
            bar.classList.toggle("is-select-open", customSelects.some(function (entry) {
                return entry.wrapper.classList.contains("is-open");
            }));
        }

        function syncCustomSelect(select) {
            var entry = customSelects.find(function (item) { return item.select === select; });
            if (!entry) return;
            var selectedOption = select.options[select.selectedIndex];
            entry.label.textContent = selectedOption ? selectedOption.textContent : "";
            $$(".noir-custom-select-option", entry.menu).forEach(function (option) {
                var active = option.dataset.value === select.value;
                option.classList.toggle("is-selected", active);
                option.setAttribute("aria-selected", active ? "true" : "false");
            });
        }

        function enhanceFilterSelect(select, name) {
            if (!select || select.dataset.noirCustomSelect === "ready") return;
            select.dataset.noirCustomSelect = "ready";
            select.classList.add("noir-select-enhanced");
            select.setAttribute("aria-hidden", "true");
            select.setAttribute("tabindex", "-1");

            var wrapper = document.createElement("div");
            var button = document.createElement("button");
            var label = document.createElement("span");
            var menu = document.createElement("div");
            var menuId = "noir-filter-" + name + "-menu";

            wrapper.className = "noir-custom-select";
            button.className = "noir-custom-select-button";
            button.type = "button";
            button.setAttribute("aria-haspopup", "listbox");
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-controls", menuId);
            label.className = "noir-custom-select-value";
            button.appendChild(label);
            button.insertAdjacentHTML("beforeend", '<span class="noir-custom-select-caret" aria-hidden="true">v</span>');

            menu.className = "noir-custom-select-menu";
            menu.id = menuId;
            menu.setAttribute("role", "listbox");
            menu.setAttribute("aria-label", select.getAttribute("aria-label") || "Filter option");
            Array.prototype.slice.call(select.options).forEach(function (option) {
                var item = document.createElement("button");
                item.type = "button";
                item.className = "noir-custom-select-option";
                item.dataset.value = option.value;
                item.setAttribute("role", "option");
                item.textContent = option.textContent;
                item.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    select.value = option.value;
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                    closeCustomSelects();
                    button.focus();
                });
                menu.appendChild(item);
            });

            wrapper.appendChild(button);
            wrapper.appendChild(menu);
            select.insertAdjacentElement("afterend", wrapper);
            var entry = { select: select, wrapper: wrapper, button: button, label: label, menu: menu };
            customSelects.push(entry);

            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                var open = !wrapper.classList.contains("is-open");
                closeCustomSelects(wrapper);
                wrapper.classList.toggle("is-open", open);
                button.setAttribute("aria-expanded", open ? "true" : "false");
                bar.classList.toggle("is-select-open", open);
            });

            button.addEventListener("keydown", function (event) {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    closeCustomSelects(wrapper);
                    wrapper.classList.add("is-open");
                    button.setAttribute("aria-expanded", "true");
                    bar.classList.add("is-select-open");
                    var active = $('.noir-custom-select-option[data-value="' + select.value + '"]', menu) || $(".noir-custom-select-option", menu);
                    if (active) active.focus();
                }
            });

            menu.addEventListener("keydown", function (event) {
                var options = $$(".noir-custom-select-option", menu);
                var index = options.indexOf(document.activeElement);
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeCustomSelects();
                    button.focus();
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    var next = event.key === "ArrowDown" ? index + 1 : index - 1;
                    if (next < 0) next = options.length - 1;
                    if (next >= options.length) next = 0;
                    if (options[next]) options[next].focus();
                }
            });

            select.addEventListener("change", function () { syncCustomSelect(select); });
            syncCustomSelect(select);
        }

        enhanceFilterSelect(sortSelect, "sort");
        enhanceFilterSelect(priceSelect, "price");

        clear.addEventListener("click", function () {
            state.family = "";
            state.gender = "";
            state.tag = "";
            sortSelect.value = "featured";
            priceSelect.value = "all";
            $$(".noir-filter-chip", controls || bar).forEach(function (chip) { chip.classList.remove("is-active"); });
            syncCustomSelect(sortSelect);
            syncCustomSelect(priceSelect);
            closeCustomSelects();
            applyFilters();
        });

        function syncFilterPlacement() {
            if (!controls) return;
            if (mobileFilters.matches) {
                if (controls.parentNode !== document.body) document.body.appendChild(controls);
                controls.classList.add("is-mobile-sheet");
            } else {
                if (controls.parentNode !== bar) bar.insertBefore(controls, controlsAnchor.nextSibling);
                controls.classList.remove("is-mobile-sheet", "is-open");
                bar.classList.remove("is-open");
                bar.classList.remove("is-select-open");
                body.classList.remove("noir-filter-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        }

        function setFilterOpen(open) {
            syncFilterPlacement();
            bar.classList.toggle("is-open", open);
            if (controls) controls.classList.toggle("is-open", open);
            body.classList.toggle("noir-filter-open", open && mobileFilters.matches);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            if (!open) closeCustomSelects();
        }

        toggle.setAttribute("aria-expanded", "false");
        if (controls) {
            controls.id = "noirFilterControls";
            toggle.setAttribute("aria-controls", controls.id);
        }

        toggle.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            setFilterOpen(!bar.classList.contains("is-open"));
        });

        bar.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        if (controls) {
            controls.addEventListener("click", function (event) {
                event.stopPropagation();
            });
        }

        document.addEventListener("click", function (event) {
            var insideControls = controls && controls.contains(event.target);
            if (bar.classList.contains("is-open") && !bar.contains(event.target) && !insideControls) {
                setFilterOpen(false);
            }
            closeCustomSelects();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeCustomSelects();
                setFilterOpen(false);
            }
        });

        if (typeof mobileFilters.addEventListener === "function") {
            mobileFilters.addEventListener("change", syncFilterPlacement);
        } else if (typeof mobileFilters.addListener === "function") {
            mobileFilters.addListener(syncFilterPlacement);
        }

        syncFilterPlacement();
        applyFilters();
    }

    function enhanceOrders(container) {
        $$(".order-card, .dashboard-order", container || document).forEach(function (card) {
            if ($(".order-timeline", card)) return;
            var statusText = (card.textContent.match(/processing|confirmed|packed|shipped|delivery|delivered/i) || ["processing"])[0].toLowerCase();
            var steps = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
            var activeIndex = statusText.indexOf("out") >= 0 ? 3 : statusText.indexOf("deliver") >= 0 ? 4 : statusText.indexOf("ship") >= 0 ? 2 : statusText.indexOf("pack") >= 0 ? 1 : 0;
            var timeline = document.createElement("div");
            timeline.className = "order-timeline";
            steps.forEach(function (step, index) {
                var item = document.createElement("div");
                item.className = "order-timeline-step" + (index < activeIndex ? " is-done" : index === activeIndex ? " is-active" : "");
                item.textContent = step;
                timeline.appendChild(item);
            });
            card.appendChild(timeline);
        });
    }

    function initOrderEnhancer() {
        enhanceOrders(document);
        var ordersList = $("#ordersList");
        if (!ordersList) return;
        new MutationObserver(function () {
            enhanceOrders(ordersList);
            enhanceEmptyStates();
        }).observe(ordersList, { childList: true, subtree: true });
    }

    function enhanceEmptyStates() {
        ["#cartItems", "#ordersList"].forEach(function (selector) {
            var box = $(selector);
            if (!box) return;
            if (box.children.length === 1 && box.textContent.trim().match(/empty|no orders/i)) {
                box.firstElementChild && box.firstElementChild.classList.add("noir-empty-state");
            }
        });
    }

    var revealObserver = null;
    var revealTargets = [
        ".section-title",
        ".hero h1",
        ".hero .subtitle",
        ".hero .btn",
        ".page-header h1",
        ".about-hero h1",
        ".hero-section h1",
        "main h1",
        "main > section h2",
        ".dashboard-panel h2",
        ".luxury-eyebrow",
        ".hero p",
        ".hero-section p",
        ".page-header p",
        ".dashboard-hero p",
        ".discount-badge",
        ".about-text",
        ".story-text",
        ".contact-form",
        ".contact-details",
        ".footer-column",
        ".noir-filter-bar",
        ".products-grid",
        ".perfume-card",
        ".collection-card",
        ".featured-card",
        ".recommendation-card",
        ".sample-card",
        ".gift-card",
        ".testimonial-card",
        ".review-card",
        ".craftsmanship-card",
        ".contact-card",
        ".video-card",
        ".detail-card",
        ".payment-method",
        ".order-card",
        ".profile-section",
        ".faq-item",
        ".help-tracking-card",
        ".tracking-summary",
        ".track-step",
        ".dashboard-sidebar",
        ".dashboard-main",
        ".dashboard-panel",
        ".dashboard-card",
        ".dashboard-order",
        ".dashboard-wishlist-card",
        ".dashboard-address-card",
        ".dashboard-detail-grid",
        ".about-img",
        ".story-image",
        ".video-thumbnail",
        ".order-summary",
        ".tracking-container",
        ".faq-container",
        ".contact-container",
        ".review-form-container",
        ".ai-advisor-container",
        ".page-header .btn",
        ".contact-form button",
        ".dashboard-track-form button",
        ".dashboard-profile-form button",
        ".perfume-actions .btn",
        ".checkout-btn",
        ".developer-note-card",
        ".noir-developer-credit"
    ].join(",");

    var revealCardTargets = [
        ".perfume-card",
        ".collection-card",
        ".featured-card",
        ".recommendation-card",
        ".sample-card",
        ".gift-card",
        ".testimonial-card",
        ".review-card",
        ".craftsmanship-card",
        ".contact-card",
        ".video-card",
        ".detail-card",
        ".payment-method",
        ".order-card",
        ".profile-section",
        ".faq-item",
        ".help-tracking-card",
        ".tracking-summary",
        ".dashboard-panel",
        ".dashboard-card",
        ".dashboard-order",
        ".dashboard-wishlist-card",
        ".dashboard-address-card",
        ".dashboard-detail-grid"
    ].join(",");

    function revealMotionReduced() {
        return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function isRevealAllowed(element) {
        return !element.closest(".modal, .checkout-modal, .edit-modal, .cart-modal, .noir-search-overlay, .mega-menu");
    }

    function applyPageSpecificReveal(element) {
        var kind = body.dataset.noirPageKind || pageKind();

        if (kind === "home" && element.matches(".hero h1, .hero p, .hero .subtitle, .hero .btn")) {
            element.classList.add("noir-home-hero-reveal");
        }
        if (kind === "about" && element.matches(".about-img, .story-image, .video-card")) {
            element.classList.add("noir-about-image-reveal");
        }
        if (kind === "about" && element.matches(".about-text, .story-text, .craftsmanship-card")) {
            element.classList.add("noir-about-copy-reveal");
        }
        if (kind === "reviews" && element.matches(".review-card, .testimonial-card, .ai-advisor-container")) {
            element.classList.add("noir-review-stagger-reveal");
        }
        if (kind === "contact" && element.matches(".contact-form, .contact-container")) {
            element.classList.add("noir-contact-form-reveal");
        }
        if (kind === "contact" && element.matches(".contact-card, .contact-details")) {
            element.classList.add("noir-contact-aura-reveal");
        }
        if (kind === "help" && element.matches(".faq-item, .detail-card")) {
            element.classList.add("noir-help-faq-reveal");
        }
        if (kind === "help" && element.matches(".tracking-container, .help-tracking-card, .tracking-summary, .track-step")) {
            element.classList.add("noir-help-track-reveal");
        }
        if (kind === "dashboard" && element.matches(".dashboard-card, .dashboard-panel, .dashboard-order, .dashboard-wishlist-card, .dashboard-address-card, .track-step")) {
            element.classList.add("noir-dashboard-stagger-reveal");
        }
        if (/collection|new-arrivals|limited/.test(kind) && element.matches(".products-grid, .page-header h1, .page-header p, .discount-badge")) {
            element.classList.add("noir-collection-frame-reveal");
        }
        if (/collection|new-arrivals|limited/.test(kind) && element.matches(".perfume-card")) {
            element.classList.add("noir-product-grid-reveal");
        }
    }

    function setRevealVariant(element, index) {
        element.classList.add("noir-reveal");
        element.style.setProperty("--reveal-delay", Math.min(index % 8, 7) * 65 + "ms");

        if (element.matches(".section-title, .hero h1, .page-header h1, .about-hero h1, .hero-section h1, main h1, main > section h2, .dashboard-panel h2")) {
            element.classList.add("noir-title-reveal");
        } else if (element.matches(revealCardTargets)) {
            element.classList.add("noir-card-reveal");
        } else if (element.matches(".about-img, .story-image, .video-thumbnail")) {
            element.classList.add("noir-image-reveal");
        } else if (element.matches(".about-text, .story-text, .contact-details, .order-summary, .tracking-container, .faq-container, .contact-container, .review-form-container, .ai-advisor-container, .footer-column, .products-grid, .noir-filter-bar")) {
            element.classList.add("noir-copy-reveal");
        } else if (element.matches(".contact-form, .dashboard-main")) {
            element.classList.add("noir-reveal-right");
        } else if (element.matches(".dashboard-sidebar")) {
            element.classList.add("noir-reveal-left");
        } else if (element.matches(".btn, button, .checkout-btn")) {
            element.classList.add("noir-button-reveal");
        }

        applyPageSpecificReveal(element);
    }

    function observeRevealElement(element) {
        if (!revealObserver || element.dataset.noirRevealObserved === "true") return;
        revealObserver.observe(element);
        element.dataset.noirRevealObserved = "true";
    }

    function applyRevealTargets(context) {
        $$(revealTargets, context || document).forEach(function (element, index) {
            if (!isRevealAllowed(element)) return;
            setRevealVariant(element, index);
            if (!("IntersectionObserver" in window) || revealMotionReduced()) {
                element.classList.add("is-visible");
            } else {
                observeRevealElement(element);
            }
        });
    }

    function initRevealSystem() {
        if (!("IntersectionObserver" in window) || revealMotionReduced()) {
            applyRevealTargets(document);
            return;
        }

        revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -46px 0px" });

        applyRevealTargets(document);
    }

    function initDashboard() {
        if (body.dataset.page !== "dashboard") return;

        var promptedForAuth = false;

        $$(".dashboard-tab").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = button.dataset.target;
                var activeSection = null;
                $$(".dashboard-tab").forEach(function (tab) { tab.classList.toggle("is-active", tab === button); });
                $$(".dashboard-section").forEach(function (section) {
                    var isActive = section.id === target;
                    section.classList.toggle("is-active", isActive);
                    if (isActive) activeSection = section;
                });
                if (activeSection) {
                    requestAnimationFrame(function () {
                        applyRevealTargets(activeSection);
                        $$(".noir-reveal", activeSection).forEach(function (element, index) {
                            element.style.setProperty("--reveal-delay", Math.min(index % 5, 4) * 65 + "ms");
                            element.classList.add("is-visible");
                        });
                    });
                }
            });
        });

        function render() {
            var user = currentUser();
            var orders = user ? readUserData("noirAuraOrders", []) : [];
            var wishlist = user ? wishlistItems() : [];
            var cart = user ? readUserData("noirAuraCart", []) : [];

            $$("#dashboardName, #heroDashboardName").forEach(function (element) {
                element.textContent = user ? displayName(user) : "Guest";
            });
            var emailNode = $("#dashboardEmail");
            if (emailNode) emailNode.textContent = user ? user.email : "Sign in to view account details";
            var ordersCount = $("#dashboardOrdersCount");
            if (ordersCount) ordersCount.textContent = orders.length;
            var wishlistCount = $("#dashboardWishlistCount");
            if (wishlistCount) wishlistCount.textContent = wishlist.length;
            var shipmentCount = $("#dashboardShipmentCount");
            if (shipmentCount) shipmentCount.textContent = orders.filter(function (order) {
                return !/delivered/i.test(order.status || "");
            }).length;
            var userGreeting = $("#userGreeting");
            if (userGreeting) userGreeting.textContent = user ? "Hello, " + displayName(user) : "";
            var orderCount = $("#orderCount");
            if (orderCount) orderCount.textContent = orders.length;

            renderDashboardOrders(orders);
            renderDashboardWishlist(wishlist);
            renderDashboardAccount(user);
            renderDashboardCart(cart);

            if (!user && !promptedForAuth) {
                promptedForAuth = true;
                setTimeout(function () {
                    openAuthModal("Please sign in or sign up to open your My Aura dashboard.", "login");
                }, 280);
            }
        }

        document.addEventListener("noiraura:session-changed", render);
        document.addEventListener("noiraura:user-data-updated", render);

        var cartIcon = $("#cartIcon");
        var cartModal = $("#cartModal");
        var closeCart = $("#closeCart");
        if (cartIcon && cartModal) cartIcon.addEventListener("click", function () {
            if (requireCurrentUser("Please sign in to open your NoirAura bag.")) cartModal.classList.add("active");
        });
        if (closeCart && cartModal) closeCart.addEventListener("click", function () { cartModal.classList.remove("active"); });
        var ordersIcon = $("#ordersIcon");
        if (ordersIcon) {
            ordersIcon.addEventListener("click", function () {
                var tab = $('.dashboard-tab[data-target="dashboardTrack"]');
                if (tab) tab.click();
            });
        }
        var userIcon = $("#userIcon");
        if (userIcon) {
            userIcon.addEventListener("click", function () {
                var tab = $('.dashboard-tab[data-target="dashboardAccount"]');
                if (tab) tab.click();
            });
        }

        render();
    }

    function orderStatusIndex(status) {
        var text = normalizeText(status || "processing");
        if (text.indexOf("out") >= 0) return 3;
        if (text.indexOf("deliver") >= 0) return 4;
        if (text.indexOf("ship") >= 0) return 2;
        if (text.indexOf("pack") >= 0) return 1;
        return 0;
    }

    function orderDetailMarkup(order) {
        var status = order.status || "processing";
        var items = Array.isArray(order.items) ? order.items : [];
        return [
            '<article class="dashboard-order">',
            '<div class="dashboard-order-head"><strong>' + escapeHtml(order.id) + '</strong><span class="status-badge">' + escapeHtml(status) + '</span></div>',
            '<p>' + escapeHtml(order.date || new Date(order.orderDate || Date.now()).toLocaleDateString()) + ' - PKR ' + Number(order.total || 0).toLocaleString() + '</p>',
            '<p>Tracking: ' + escapeHtml(order.tracking || "Pending") + '</p>',
            items.length ? '<div class="dashboard-order-items">' + items.map(function (item) {
                return '<span>' + escapeHtml(item.name) + ' x ' + Number(item.quantity || 1) + '</span>';
            }).join("") + '</div>' : "",
            '</article>'
        ].join("");
    }

    function trackingMarkup(order, message) {
        if (!order) {
            return '<div class="noir-empty-state">' + escapeHtml(message || "No active shipments to track.") + '</div>';
        }
        var activeIndex = orderStatusIndex(order.status);
        return [
            '<div class="tracking-summary">',
            '<strong>' + escapeHtml(order.id) + '</strong>',
            '<span>' + escapeHtml(order.tracking || "Tracking pending") + '</span>',
            '</div>',
            '<div class="tracking-vertical">',
            ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"].map(function (step, index) {
                var state = index < activeIndex ? " is-done" : index === activeIndex ? " is-active" : "";
                return '<div class="track-step' + state + '"><span class="track-dot"></span><div><strong>' + step + '</strong><p>' + (index <= activeIndex ? "NoirAura update recorded for this account." : "NoirAura Express update pending.") + '</p></div></div>';
            }).join(""),
            '</div>'
        ].join("");
    }

    function orderLookupToken(value) {
        return normalizeText(value).replace(/^#/, "");
    }

    function findOrderByLookup(query, orders) {
        var needle = orderLookupToken(query);
        if (!needle) return null;
        return (orders || []).find(function (order) {
            return orderLookupToken(order.id) === needle || orderLookupToken(order.tracking) === needle;
        }) || null;
    }

    function orderDateLabel(order) {
        if (order.date) return order.date;
        if (order.orderDate) return new Date(order.orderDate).toLocaleDateString();
        return new Date().toLocaleDateString();
    }

    function helpTrackingMarkup(order) {
        var items = Array.isArray(order.items) ? order.items : [];
        var status = order.status || "processing";
        return [
            '<article class="help-tracking-card">',
            '<div class="help-tracking-head">',
            '<div><span class="luxury-eyebrow">Order ID</span><strong>' + escapeHtml(order.id) + '</strong></div>',
            '<span class="status-badge">' + escapeHtml(status) + '</span>',
            '</div>',
            '<div class="help-tracking-meta">',
            '<div><span>Order date</span><strong>' + escapeHtml(orderDateLabel(order)) + '</strong></div>',
            '<div><span>Total</span><strong>PKR ' + Number(order.total || 0).toLocaleString() + '</strong></div>',
            '<div><span>Tracking</span><strong>' + escapeHtml(order.tracking || "Pending") + '</strong></div>',
            '</div>',
            '<div class="help-tracking-products">',
            '<span class="luxury-eyebrow">Products</span>',
            items.length ? items.map(function (item) {
                return '<p>' + escapeHtml(item.name || "NoirAura scent") + ' <span>x ' + Number(item.quantity || 1) + '</span></p>';
            }).join("") : '<p>Products saved with this order are unavailable.</p>',
            '</div>',
            trackingMarkup(order),
            '</article>'
        ].join("");
    }

    function initHelpOrderTracking() {
        var container = $(".tracking-container");
        var oldForm = $("#tracking-form");
        var results = $("#tracking-results");
        if (!container || !oldForm || !results) return;

        var form = document.createElement("form");
        form.className = "tracking-form help-track-form";
        form.id = "tracking-form";
        form.setAttribute("novalidate", "novalidate");
        form.innerHTML = [
            '<div class="form-group">',
            '<label for="order-id">Order ID or tracking number</label>',
            '<input type="text" id="order-id" name="order-id" placeholder="#NOIR-2026-1234 or TRK123456" autocomplete="off" required>',
            '</div>',
            '<button type="submit" class="submit-btn help-track-submit" id="track-order-btn">Track Order</button>'
        ].join("");
        oldForm.replaceWith(form);

        var loader = $("#tracking-loader");
        if (loader) loader.remove();
        results.className = "tracking-results help-track-result";
        results.setAttribute("aria-live", "polite");
        results.style.display = "block";

        function renderPrompt() {
            results.innerHTML = trackingMarkup(null, currentUser() ? "Enter an order ID from your account to view live NoirAura tracking." : "Sign in to track an order from your account.");
        }

        renderPrompt();

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var user = currentUser();
            if (!user) {
                results.innerHTML = trackingMarkup(null, "Please sign in to track orders for your account.");
                openAuthModal("Please sign in to track orders for your account.", "login");
                return;
            }

            var query = $("#order-id", form).value;
            var found = findOrderByLookup(query, readUserData("noirAuraOrders", []));
            results.innerHTML = found ? helpTrackingMarkup(found) : trackingMarkup(null, "Order not found for this account.");
        }, true);

        document.addEventListener("noiraura:session-changed", renderPrompt);
    }

    function renderDashboardOrders(orders) {
        var list = $("#dashboardOrdersList");
        var fullList = $("#dashboardOrdersListFull");
        var track = $("#dashboardTracking");
        if (!list || !track) return;

        if (!orders.length) {
            list.innerHTML = '<div class="noir-empty-state">No orders yet. Your first NoirAura ritual will appear here.</div>';
            if (fullList) fullList.innerHTML = '<div class="noir-empty-state">No orders yet. Your first NoirAura ritual will appear here.</div>';
            track.innerHTML = [
                '<form class="dashboard-track-form" id="dashboardTrackForm">',
                '<label for="dashboardTrackInput">Order ID or tracking number</label>',
                '<div><input id="dashboardTrackInput" type="text" autocomplete="off" placeholder="#NOIR-2026-1234 or TRK123456"><button class="dashboard-action" type="submit">Track</button></div>',
                '</form>',
                '<div class="dashboard-track-result" id="dashboardTrackingResult">',
                '<div class="noir-empty-state">No active shipments to track.</div>',
                '</div>'
            ].join("");
            var emptyTrackForm = $("#dashboardTrackForm");
            if (emptyTrackForm) {
                emptyTrackForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    $("#dashboardTrackingResult").innerHTML = trackingMarkup(null, "Order not found for this account.");
                });
            }
            return;
        }

        var orderMarkup = orders.map(orderDetailMarkup).join("");
        list.innerHTML = orders.slice(0, 3).map(orderDetailMarkup).join("");
        if (fullList) fullList.innerHTML = orderMarkup;
        enhanceOrders(list);
        if (fullList) enhanceOrders(fullList);

        track.innerHTML = [
            '<form class="dashboard-track-form" id="dashboardTrackForm">',
            '<label for="dashboardTrackInput">Order ID or tracking number</label>',
            '<div><input id="dashboardTrackInput" type="text" autocomplete="off" placeholder="#NOIR-2026-1234 or TRK123456"><button class="dashboard-action" type="submit">Track</button></div>',
            '</form>',
            '<div class="dashboard-track-result" id="dashboardTrackingResult">',
            trackingMarkup(orders[0]),
            '</div>'
        ].join("");

        var trackForm = $("#dashboardTrackForm");
        if (trackForm) {
            trackForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var found = findOrderByLookup($("#dashboardTrackInput").value, orders);
                $("#dashboardTrackingResult").innerHTML = trackingMarkup(found, "Order not found for this account.");
            });
        }
    }

    function renderDashboardWishlist(items) {
        var list = $("#dashboardWishlistList");
        if (!list) return;

        if (!items.length) {
            list.innerHTML = '<div class="noir-empty-state">Your wishlist is waiting for a signature scent.</div>';
            return;
        }

        var markup = items.map(function (item) {
            var href = item.page || "index.html";
            if (item.productId) href += "?product=" + encodeURIComponent(item.productId);
            return [
                '<article class="dashboard-wishlist-card">',
                '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.name) + '">',
                '<div><strong>' + escapeHtml(item.name) + '</strong><p>' + escapeHtml(item.family || "Signature Aura") + '</p><p>' + escapeHtml(item.price || "") + '</p></div>',
                '<a class="btn" href="' + escapeAttr(href) + '">View</a>',
                '</article>'
            ].join("");
        }).join("");
        list.innerHTML = markup;
    }

    function renderDashboardAccount(user) {
        var details = $("#dashboardAccountDetails");
        var addresses = $("#dashboardAddressesList");
        var accountPanel = $("#dashboardAccount .dashboard-panel");
        var oldForm = $("#dashboardProfileForm");
        if (oldForm) oldForm.remove();

        if (!user) {
            if (details) details.innerHTML = '<div class="noir-empty-state">Sign in to view and edit your account details.</div>';
            if (addresses) addresses.innerHTML = '<div class="noir-empty-state">Your saved addresses will appear after login.</div>';
            return;
        }

        if (details) {
            details.innerHTML = [
                '<div><span class="luxury-eyebrow">Name</span><p>' + escapeHtml(displayName(user)) + '</p></div>',
                '<div><span class="luxury-eyebrow">Email</span><p>' + escapeHtml(user.email) + '</p></div>',
                '<div><span class="luxury-eyebrow">Phone</span><p>' + escapeHtml(user.phone || "Not added") + '</p></div>',
                '<div><span class="luxury-eyebrow">Postal Code</span><p>' + escapeHtml(profileZip(user) || "Not added") + '</p></div>'
            ].join("");
        }
        if (addresses) {
            addresses.innerHTML = [
                '<article class="dashboard-address-card"><strong>Default Shipping</strong><p>' + escapeHtml([user.address, user.city, "Pakistan", profileZip(user)].filter(Boolean).join(", ") || "Add a shipping address in Account Details.") + '</p></article>',
                '<article class="dashboard-address-card"><strong>Gift Delivery</strong><p>Add an alternate address during checkout.</p></article>'
            ].join("");
        }

        if (accountPanel) {
            accountPanel.insertAdjacentHTML("beforeend", [
                '<form class="dashboard-profile-form" id="dashboardProfileForm">',
                '<span class="luxury-eyebrow">Edit Profile</span>',
                '<div class="dashboard-form-grid">',
                '<label>Full Name<input name="fullName" type="text" maxlength="80" value="' + escapeAttr(displayName(user)) + '" required></label>',
                '<label>Email<input name="email" type="email" maxlength="254" value="' + escapeAttr(user.email || "") + '" required></label>',
                '<label>Phone<input name="phone" type="tel" maxlength="24" value="' + escapeAttr(user.phone || "") + '"></label>',
                '<label>City<input name="city" type="text" maxlength="60" value="' + escapeAttr(user.city || "") + '"></label>',
                '<label>Postal Code<input name="postalCode" type="text" maxlength="16" value="' + escapeAttr(profileZip(user)) + '"></label>',
                '<label class="dashboard-form-wide">Address<textarea name="address" rows="3" maxlength="160">' + escapeHtml(user.address || "") + '</textarea></label>',
                '</div>',
                '<button class="dashboard-action" type="submit">Save Profile</button>',
                '<p class="dashboard-profile-message" aria-live="polite"></p>',
                '</form>'
            ].join(""));

            $("#dashboardProfileForm").addEventListener("submit", function (event) {
                event.preventDefault();
                var form = event.currentTarget;
                var result = updateCurrentUserProfile({
                    fullName: form.elements.fullName.value,
                    email: form.elements.email.value,
                    phone: form.elements.phone.value,
                    city: form.elements.city.value,
                    postalCode: form.elements.postalCode.value,
                    address: form.elements.address.value
                });
                var message = $(".dashboard-profile-message", form);
                if (message) {
                    message.classList.toggle("is-error", !result.ok);
                    message.textContent = result.message;
                }
            });
        }
    }

    function renderDashboardCart(cart) {
        var count = $("#cartCount");
        var totalNode = $("#cartTotal");
        var itemsNode = $("#cartItems");
        if (count) count.textContent = cart.reduce(function (sum, item) { return sum + Number(item.quantity || 0); }, 0);
        if (totalNode) totalNode.textContent = "PKR " + cart.reduce(function (sum, item) { return sum + Number(item.price || 0) * Number(item.quantity || 0); }, 0).toLocaleString();
        if (!itemsNode) return;
        if (!cart.length) {
            itemsNode.innerHTML = '<p class="noir-empty-state">Your cart is empty.</p>';
            return;
        }
        itemsNode.innerHTML = cart.map(function (item) {
            return [
                '<div class="cart-item">',
                '<div class="cart-item-img" style="background-image:url(\'' + item.image + '\')"></div>',
                '<div class="cart-item-details"><h4>' + item.name + '</h4><p>PKR ' + Number(item.price || 0).toLocaleString() + '</p><span>Qty ' + item.quantity + '</span></div>',
                '</div>'
            ].join("");
        }).join("");
    }

    function initBackToTop() {
        var existing = $("#scrollToTop") || $(".scroll-to-top") || $(".noir-back-to-top");
        var button = existing;

        if (!button || button.tagName.toLowerCase() !== "button") {
            button = document.createElement("button");
            if (existing) {
                button.id = existing.id || "scrollToTop";
                existing.replaceWith(button);
            } else {
                button.id = "scrollToTop";
                document.body.appendChild(button);
            }
        }

        button.type = "button";
        button.className = "noir-back-to-top scroll-to-top";
        button.setAttribute("aria-label", "Back to top");
        button.setAttribute("title", "Back to top");
        button.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';

        function setVisible() {
            var isVisible = window.pageYOffset > 420;
            button.classList.toggle("is-visible", isVisible);
            button.classList.toggle("active", isVisible);
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
            });
        });

        setVisible();
        window.addEventListener("scroll", setVisible, { passive: true });
    }

    function initDeveloperFooterCredit() {
        $$("footer").forEach(function (footer) {
            if ($(".noir-developer-credit", footer)) return;

            var bottom = $(".footer-bottom", footer) || footer;
            var credit = document.createElement("div");
            credit.className = "noir-developer-credit";
            credit.innerHTML = [
                '<span>Designed &amp; Developed by Eshal Noor Asghar</span>',
                '<nav class="noir-developer-links" aria-label="Developer professional links">',
                '<a href="https://www.linkedin.com/in/eshal-noor-dev" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>',
                '<a href="https://github.com/eshal-000" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><i class="fab fa-github" aria-hidden="true"></i></a>',
                '<a href="mailto:eshaldeveloper3@gmail.com" aria-label="Email" title="Email"><i class="fas fa-envelope" aria-hidden="true"></i></a>',
                '</nav>'
            ].join("");
            bottom.appendChild(credit);
        });
    }

    function initProductDeepLinks() {
        var params = new URLSearchParams(window.location.search);
        var productId = params.get("product");
        if (!productId) return;

        var detailsButton = $$(".view-details").find(function (button) {
            return button.getAttribute("data-id") === productId;
        });
        if (!detailsButton) return;

        function openDetails() {
            var authModal = $("#authModal");
            if (authModal) authModal.classList.remove("active");
            var card = detailsButton.closest(".perfume-card");
            if (card) {
                card.scrollIntoView({ block: "center", behavior: "smooth" });
            }
            detailsButton.click();
        }

        setTimeout(openDetails, 220);
        setTimeout(openDetails, 1180);
    }

    function initMutationPolish() {
        var observer = new MutationObserver(function () {
            enhanceProductCards();
            enhanceEmptyStates();
            applyRevealTargets(document);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initHeader();
        initLayoutOffsets();
        initHomeHeroVideo();
        initPromoBannerBehavior();
        initMegaMenu();
        initMobileNav();
        initAuthExperience();
        initSectionTitles();
        enhanceProductCards();
        enhanceProductModal();
        initSearch();
        initCollectionFilters();
        initAuraFinder();
        initLuxuryPaymentMethods();
        document.addEventListener("click", completePayPalCheckout, true);
        initAccountRouting();
        initOrderEnhancer();
        enhanceEmptyStates();
        initDashboard();
        initHelpOrderTracking();
        initDeveloperFooterCredit();
        initBackToTop();
        initProductDeepLinks();
        initRevealSystem();
        initMutationPolish();
    });
})();
