(function () {
    "use strict";

    var body = document.body;
    body.classList.add("noiraura-luxury");

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

    function normalizeText(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function parsePrice(value) {
        return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
    }

    function currentPage() {
        return location.pathname.split("/").pop() || "index.html";
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
            item.family,
            item.gender,
            (item.tags || []).join(" "),
            (item.notes || []).join(" "),
            item.page
        ].join(" "));
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
        return index.map(function (item) {
            var profile = getProfile(item.name + " " + item.family);
            if (!item.notes || !item.notes.length) item.notes = getProfileNotes(profile);
            if (!item.family) item.family = profile.family;
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
            menu.classList.toggle("active", open);
            trigger.classList.toggle("menu-open", open);
            trigger.classList.toggle("open", open && window.matchMedia("(max-width: 900px)").matches);
            if (triggerLink) triggerLink.setAttribute("aria-expanded", open ? "true" : "false");
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
        if (!button || !links) return;

        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-expanded", links.classList.contains("active") ? "true" : "false");

        function syncExpanded() {
            button.setAttribute("aria-expanded", links.classList.contains("active") ? "true" : "false");
        }

        button.addEventListener("click", function () {
            setTimeout(syncExpanded, 0);
        });

        button.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                links.classList.toggle("active");
                syncExpanded();
            }
        });

        $$(".nav-links a").forEach(function (link) {
            link.addEventListener("click", function () {
                if (!link.closest(".has-mega-menu") && links.classList.contains("active")) {
                    links.classList.remove("active");
                    syncExpanded();
                }
            });
        });
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

    function wishlistItems() {
        return safeJson("noirAuraWishlist", []);
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
            var id = location.pathname.split("/").pop() + ":" + productId + ":" + title.textContent.trim();
            var familyName = profile.family.replace(" Amber", "").replace(" Musk", "").replace(" Floral", "");

            card.dataset.productName = title.textContent.trim();
            card.dataset.productPrice = parsePrice(price ? price.textContent : "");
            card.dataset.productFamily = familyName;
            card.dataset.productGender = /men/i.test(label) ? "Men" : /women/i.test(label) ? "Women" : "Unisex";
            card.dataset.productCategory = label;
            card.dataset.productTags = currentPage() === "bestse.html" ? "Trending Best Rated" :
                currentPage() === "sam.html" ? "Sample Set Featured" :
                currentPage() === "gif.html" ? "Gift Set Featured" :
                currentPage() === "new.html" ? "New Trending" :
                currentPage() === "limi.html" ? "Limited Exclusive" : "";
            card.dataset.searchText = productSearchText({
                name: title.textContent,
                category: label,
                family: familyName,
                gender: card.dataset.productGender,
                tags: card.dataset.productTags.split(" "),
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
                var saved = toggleWishlist({
                    id: id,
                    productId: productId,
                    page: location.pathname.split("/").pop() || "index.html",
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

            if (image) {
                image.setAttribute("role", "img");
                image.setAttribute("aria-label", productName);
                var imageMatch = image.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
                if (imageMatch) {
                    image.style.backgroundImage = [
                        "radial-gradient(circle at 50% 42%, rgba(187, 160, 242, 0.2), transparent 30%)",
                        "linear-gradient(145deg, rgba(5, 4, 7, 0.95), rgba(44, 30, 58, 0.54) 54%, rgba(0, 0, 0, 0.95))",
                        "url('" + imageMatch[1] + "')"
                    ].join(", ");
                }
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
            if (localStorage.getItem("noirAuraUser")) {
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

    function sortProducts(items, sortMode) {
        var sorted = items.slice();
        if (sortMode === "price-asc") sorted.sort(function (a, b) { return a.price - b.price; });
        if (sortMode === "price-desc") sorted.sort(function (a, b) { return b.price - a.price; });
        if (sortMode === "name-asc") sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
        if (sortMode === "newest") sorted.sort(function (a, b) { return b.page.localeCompare(a.page) || a.name.localeCompare(b.name); });
        if (sortMode === "trending") sorted.sort(function (a, b) {
            return Number((b.tags || []).join(" ").match(/Trending|Best Rated|Featured|Limited|New/i) !== null) -
                Number((a.tags || []).join(" ").match(/Trending|Best Rated|Featured|Limited|New/i) !== null);
        });
        return sorted;
    }

    function initSearch() {
        var navIcons = $(".nav-icons");
        if (!navIcons || $(".noir-search-trigger")) return;

        var trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "noir-search-trigger";
        trigger.setAttribute("aria-label", "Search NoirAura");
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
            '<div class="noir-search-tools">',
            '<div class="noir-search-input-wrap"><i class="fas fa-search"></i><input class="noir-search-input" type="search" placeholder="Search Oud, Midnight, Floral, Amber, Men..." autocomplete="off"></div>',
            '<select class="noir-search-sort" aria-label="Sort search results"><option value="featured">Featured</option><option value="trending">Trending</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name A-Z</option></select>',
            '<button class="noir-search-clear" type="button">Clear</button>',
            '</div>',
            '<div class="noir-search-meta">Start typing to search the NoirAura archive.</div>',
            '<div class="noir-search-results"></div>',
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
            setTimeout(function () { input.focus(); }, 60);
            render();
        }

        function closeSearch() {
            overlay.classList.remove("is-open");
            trigger.classList.remove("is-active");
            trigger.focus();
        }

        function resultMarkup(item) {
            return [
                '<a class="noir-search-result" href="' + item.page + '">',
                '<img src="' + item.image + '" alt="' + item.name + '">',
                '<div><h3>' + item.name + '</h3><p>' + item.category + ' - ' + item.family + ' - ' + item.gender + '</p><p>' + (item.notes || []).slice(0, 3).join(" - ") + '</p></div>',
                '<strong>' + item.priceText + '</strong>',
                '</a>'
            ].join("");
        }

        function render() {
            var query = normalizeText(input.value);
            var terms = query.split(" ").filter(Boolean);
            var matches = index.filter(function (item) {
                if (!terms.length) return true;
                return terms.every(function (term) { return item.searchText.indexOf(term) >= 0; });
            });
            matches = sortProducts(matches, sort.value).slice(0, 24);
            meta.textContent = terms.length ? matches.length + " matching scents" : "Showing featured NoirAura scents";
            if (!matches.length) {
                results.innerHTML = '<div class="noir-empty-state noir-search-empty">No scent matched that search. Try Oud, Amber, Floral, Men, Gift Set, or Midnight.</div>';
                return;
            }
            results.innerHTML = matches.map(resultMarkup).join("");
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
            return all.concat((card.dataset.productTags || "").split(" ").filter(Boolean));
        }, []))).sort();

        var bar = document.createElement("div");
        bar.className = "noir-filter-bar";
        bar.innerHTML = [
            '<button class="noir-filter-toggle" type="button"><i class="fas fa-sliders-h"></i> Filter</button>',
            '<div class="noir-filter-controls">',
            '<input class="noir-filter-search" type="search" placeholder="Search this edit..." autocomplete="off">',
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
        var searchInput = $(".noir-filter-search", bar);
        var sortSelect = $(".noir-filter-sort", bar);
        var priceSelect = $(".noir-filter-price", bar);
        var meta = $(".noir-filter-meta", bar);
        var toggle = $(".noir-filter-toggle", bar);
        var clear = $(".noir-filter-clear", bar);

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
                tags: (card.dataset.productTags || "").split(" ").filter(Boolean),
                searchText: card.dataset.searchText || ""
            };
        }

        function applyFilters() {
            var query = normalizeText(searchInput.value);
            var terms = query.split(" ").filter(Boolean);
            var items = cards.map(cardItem);
            var visible = items.filter(function (item) {
                var card = item.card;
                var matchesSearch = !terms.length || terms.every(function (term) { return item.searchText.indexOf(term) >= 0; });
                var matchesFamily = !state.family || card.dataset.productFamily === state.family;
                var matchesGender = !state.gender || card.dataset.productGender === state.gender;
                var matchesTag = !state.tag || (card.dataset.productTags || "").indexOf(state.tag) >= 0;
                var matchesPrice = priceMatches(item.price, priceSelect.value);
                return matchesSearch && matchesFamily && matchesGender && matchesTag && matchesPrice;
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
                $$('.noir-filter-chip[data-filter="' + type + '"]', bar).forEach(function (other) {
                    other.classList.toggle("is-active", state[type] === other.dataset.value);
                });
                applyFilters();
            });
        });

        [searchInput, sortSelect, priceSelect].forEach(function (control) {
            control.addEventListener(control.tagName === "INPUT" ? "input" : "change", applyFilters);
        });

        clear.addEventListener("click", function () {
            state.family = "";
            state.gender = "";
            state.tag = "";
            searchInput.value = "";
            sortSelect.value = "featured";
            priceSelect.value = "all";
            $$(".noir-filter-chip", bar).forEach(function (chip) { chip.classList.remove("is-active"); });
            applyFilters();
        });

        toggle.addEventListener("click", function () {
            bar.classList.toggle("is-open");
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") bar.classList.remove("is-open");
        });

        applyFilters();
    }

    function enhanceOrders(container) {
        $$(".order-card, .dashboard-order", container || document).forEach(function (card) {
            if ($(".order-timeline", card)) return;
            var statusText = (card.textContent.match(/processing|confirmed|packed|shipped|delivery|delivered/i) || ["processing"])[0].toLowerCase();
            var steps = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
            var activeIndex = statusText.indexOf("deliver") >= 0 ? 4 : statusText.indexOf("ship") >= 0 ? 2 : statusText.indexOf("pack") >= 0 ? 1 : 0;
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

    function initRevealSystem() {
        var revealTargets = [
            ".section-title",
            ".perfume-card",
            ".testimonial-card",
            ".review-card",
            ".craftsmanship-card",
            ".contact-card",
            ".video-card",
            ".about-img",
            ".story-image",
            ".about-text",
            ".contact-form",
            ".contact-details",
            ".faq-item",
            ".dashboard-panel",
            ".dashboard-card"
        ].join(",");

        $$(revealTargets).forEach(function (element, index) {
            if (!element.classList.contains("noir-reveal")) {
                element.classList.add("noir-reveal");
                if (element.matches(".perfume-card, .testimonial-card, .review-card, .craftsmanship-card, .contact-card")) {
                    element.classList.add("noir-card-reveal");
                    element.style.setProperty("--reveal-delay", Math.min(index % 6, 5) * 70 + "ms");
                }
                if (element.matches(".about-img, .story-image, .video-card")) {
                    element.classList.add("noir-image-reveal");
                }
            }
        });

        if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            $$(".noir-reveal").forEach(function (element) {
                element.classList.add("is-visible");
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        $$(".noir-reveal").forEach(function (element) {
            observer.observe(element);
        });
    }

    function initDashboard() {
        if (body.dataset.page !== "dashboard") return;

        var user = localStorage.getItem("noirAuraUser");
        var email = localStorage.getItem("noirAuraUserEmail") || "guest@noiraura.com";
        var zip = localStorage.getItem("noirAuraUserZipCode") || "54000";
        var orders = safeJson("noirAuraOrders", []);
        var wishlist = wishlistItems();
        var cart = safeJson("noirAuraCart", []);

        $$("#dashboardName, #heroDashboardName").forEach(function (element) {
            element.textContent = user || "Guest";
        });
        var emailNode = $("#dashboardEmail");
        if (emailNode) emailNode.textContent = email;
        var ordersCount = $("#dashboardOrdersCount");
        if (ordersCount) ordersCount.textContent = orders.length;
        var wishlistCount = $("#dashboardWishlistCount");
        if (wishlistCount) wishlistCount.textContent = wishlist.length;
        var shipmentCount = $("#dashboardShipmentCount");
        if (shipmentCount) shipmentCount.textContent = orders.length ? "1" : "0";
        var userGreeting = $("#userGreeting");
        if (userGreeting && user) userGreeting.textContent = "Hello, " + user;
        var orderCount = $("#orderCount");
        if (orderCount) orderCount.textContent = orders.length;

        $$(".dashboard-tab").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = button.dataset.target;
                $$(".dashboard-tab").forEach(function (tab) { tab.classList.toggle("is-active", tab === button); });
                $$(".dashboard-section").forEach(function (section) { section.classList.toggle("is-active", section.id === target); });
            });
        });

        renderDashboardOrders(orders);
        renderDashboardWishlist(wishlist);
        renderDashboardAccount(user, email, zip);
        renderDashboardCart(cart);

        var logout = $("#dashboardLogout");
        if (logout) {
            logout.addEventListener("click", function () {
                localStorage.removeItem("noirAuraUser");
                localStorage.removeItem("noirAuraUserEmail");
                localStorage.removeItem("noirAuraUserZipCode");
                window.location.href = "index.html";
            });
        }

        var cartIcon = $("#cartIcon");
        var cartModal = $("#cartModal");
        var closeCart = $("#closeCart");
        if (cartIcon && cartModal) cartIcon.addEventListener("click", function () { cartModal.classList.add("active"); });
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
    }

    function renderDashboardOrders(orders) {
        var list = $("#dashboardOrdersList");
        var fullList = $("#dashboardOrdersListFull");
        var track = $("#dashboardTracking");
        if (!list || !track) return;

        if (!orders.length) {
            list.innerHTML = '<div class="noir-empty-state">No orders yet. Your first NoirAura ritual will appear here.</div>';
            if (fullList) fullList.innerHTML = '<div class="noir-empty-state">No orders yet. Your first NoirAura ritual will appear here.</div>';
            track.innerHTML = '<div class="noir-empty-state">No active shipments to track.</div>';
            return;
        }

        var orderMarkup = orders.map(function (order) {
            return [
                '<article class="dashboard-order">',
                '<div class="dashboard-order-head"><strong>' + order.id + '</strong><span class="status-badge">' + (order.status || "processing") + '</span></div>',
                '<p>' + (order.date || "") + ' - PKR ' + Number(order.total || 0).toLocaleString() + '</p>',
                '<p>Tracking: ' + (order.tracking || "Pending") + '</p>',
                '</article>'
            ].join("");
        }).join("");
        list.innerHTML = orderMarkup;
        if (fullList) fullList.innerHTML = orderMarkup;
        enhanceOrders(list);
        if (fullList) enhanceOrders(fullList);

        track.innerHTML = [
            '<div class="tracking-vertical">',
            ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"].map(function (step) {
                return '<div class="track-step"><span class="track-dot"></span><div><strong>' + step + '</strong><p>' + (step === "Confirmed" ? "Order " + orders[0].id + " is in progress." : "NoirAura Express update pending.") + '</p></div></div>';
            }).join(""),
            "</div>"
        ].join("");
    }

    function renderDashboardWishlist(items) {
        var list = $("#dashboardWishlistList");
        var savedList = $("#dashboardSavedList");
        if (!list && !savedList) return;

        if (!items.length) {
            var empty = '<div class="noir-empty-state">Your wishlist is waiting for a signature scent.</div>';
            if (list) list.innerHTML = empty;
            if (savedList) savedList.innerHTML = empty;
            return;
        }

        var markup = items.map(function (item) {
            return [
                '<article class="dashboard-wishlist-card">',
                '<img src="' + item.image + '" alt="' + item.name + '">',
                '<div><strong>' + item.name + '</strong><p>' + (item.family || "Signature Aura") + '</p><p>' + (item.price || "") + '</p></div>',
                '<a class="btn" href="' + (item.page || "index.html") + '">View</a>',
                '</article>'
            ].join("");
        }).join("");
        if (list) list.innerHTML = markup;
        if (savedList) savedList.innerHTML = markup;
    }

    function renderDashboardAccount(user, email, zip) {
        var details = $("#dashboardAccountDetails");
        var addresses = $("#dashboardAddresses");
        if (details) {
            details.innerHTML = [
                '<div><span class="luxury-eyebrow">Name</span><p>' + (user || "Guest") + '</p></div>',
                '<div><span class="luxury-eyebrow">Email</span><p>' + email + '</p></div>',
                '<div><span class="luxury-eyebrow">Phone</span><p>+92 300 1234567</p></div>',
                '<div><span class="luxury-eyebrow">ZIP Code</span><p>' + zip + '</p></div>'
            ].join("");
        }
        if (addresses) {
            addresses.innerHTML = [
                '<article class="dashboard-address-card"><strong>Default Shipping</strong><p>Luxury Avenue, Karachi, Pakistan ' + zip + '</p></article>',
                '<article class="dashboard-address-card"><strong>Gift Delivery</strong><p>Add an alternate address during checkout.</p></article>'
            ].join("");
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

    function initMutationPolish() {
        var observer = new MutationObserver(function () {
            enhanceProductCards();
            enhanceEmptyStates();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initHeader();
        initMegaMenu();
        initMobileNav();
        initSectionTitles();
        enhanceProductCards();
        enhanceProductModal();
        initSearch();
        initCollectionFilters();
        initAuraFinder();
        initAccountRouting();
        initPasswordToggles();
        initOrderEnhancer();
        enhanceEmptyStates();
        initDashboard();
        initRevealSystem();
        initMutationPolish();
    });
})();
