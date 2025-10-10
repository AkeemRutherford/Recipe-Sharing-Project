import React, { useState, useMemo } from 'react';

// --- Enhanced Mock Data ---
const mockRecipes = [
    {
        id: 1,
        title: "Grandma's Classic Lasagna",
        author: { name: "Maria Rossi", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Maria Rossi&backgroundColor=E9D5A1" },
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&auto=format&fit=crop",
        description: "A rich and cheesy lasagna with a secret family sauce recipe. Perfect for family gatherings and cozy nights in.",
        prepTime: "30 min",
        cookTime: "1 hr 15 min",
        servings: 8,
        difficulty: "Intermediate",
        tags: ["Italian", "Comfort Food", "Family Dinner", "Kosher-Adaptable"],
        ingredients: [
            { amount: "1 lb", name: "Lean ground beef" },
            { amount: "1", name: "Large onion, chopped" },
            { amount: "3 cloves", name: "Garlic, minced" },
            { amount: "28 oz can", name: "Crushed tomatoes" },
            { amount: "12 oz can", name: "Tomato paste" },
            { amount: "1/2 cup", name: "Red wine" },
            { amount: "2 tsp", name: "Dried oregano" },
            { amount: "1 tsp", name: "Salt" },
            { amount: "1/2 tsp", name: "Black pepper" },
            { amount: "16 oz", name: "Lasagna noodles" },
            { amount: "32 oz", name: "Ricotta cheese" },
            { amount: "1", name: "Large egg" },
            { amount: "1/2 cup", name: "Grated Parmesan cheese" },
            { amount: "1 lb", name: "Mozzarella cheese, sliced" },
        ],
        instructions: [
            "In a large skillet, cook the ground beef and onion over medium heat until browned. Drain fat. Add garlic and cook for 1 minute more.",
            "Stir in crushed tomatoes, tomato paste, red wine, oregano, salt, and pepper. Bring to a boil, then reduce heat and simmer for at least 30 minutes.",
            "Cook lasagna noodles according to package directions. Drain.",
            "In a bowl, mix ricotta, egg, and Parmesan cheese.",
            "Preheat oven to 375°F (190°C).",
            "To assemble, spread a layer of meat sauce in the bottom of a 9x13 inch baking dish. Place a layer of noodles on top. Spread with a layer of the ricotta mixture. Top with a layer of mozzarella. Repeat layers, ending with a final layer of sauce and mozzarella on top.",
            "Bake for 30-40 minutes, or until bubbly and golden brown. Let stand for 10 minutes before serving.",
        ],
        comments: [
            { user: "VeggieLover", text: "Has anyone tried this with a plant-based ground 'beef'? Looking for a vegetarian option!", type: "question", timestamp: "2 days ago" },
            { user: "SpiceQueen", text: "I added a pinch of red pepper flakes to the sauce for a little kick. It was delicious!", type: "suggestion", change: { type: "Addition", ingredient: "Red pepper flakes", amount: "1/4 tsp" }, timestamp: "1 week ago" },
            { user: "LowCarbLife", text: "Substituted the lasagna noodles with thinly sliced zucchini. Worked great but be sure to salt the zucchini first to draw out moisture.", type: "suggestion", change: { type: "Substitution", from: "Lasagna noodles", to: "Zucchini slices" }, timestamp: "3 days ago" },
            { user: "MealPrepMaster", text: "This freezes really well! I make a double batch and freeze one for later. Just add 15-20 mins to the baking time from frozen.", type: "tip", timestamp: "5 days ago" },
            { user: "ChefChloe", text: "For a richer sauce, I suggest using half ground beef and half ground pork.", type: "suggestion", change: { type: "Substitution", from: "Lean ground beef", to: "Half ground beef, half ground pork" }, timestamp: "1 week ago" },
        ],
        likes: 342,
        saves: 128
    },
    {
        id: 2,
        title: "Spicy Vegan Chili",
        author: { name: "Alex Chen", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alex Chen&backgroundColor=B2D8D8" },
        image: "https://images.pexels.com/photos/34227755/pexels-photo-34227755.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "A hearty and flavorful vegan chili packed with beans, veggies, and a secret blend of spices. Perfect for a chilly day.",
        prepTime: "20 min",
        cookTime: "45 min",
        servings: 6,
        difficulty: "Easy",
        tags: ["Vegan", "Gluten-Free", "Weeknight", "Spicy"],
        ingredients: [
            { amount: "2 tbsp", name: "Olive oil" },
            { amount: "1", name: "Red onion, chopped" },
            { amount: "1", name: "Red bell pepper, chopped" },
            { amount: "2", name: "Jalapeños, minced" },
            { amount: "4 cloves", name: "Garlic, minced" },
            { amount: "2 tbsp", name: "Chili powder" },
            { amount: "1 tbsp", name: "Cumin" },
            { amount: "1 tsp", name: "Smoked paprika" },
            { amount: "28 oz can", name: "Diced tomatoes, undrained" },
            { amount: "15 oz can", name: "Kidney beans, rinsed" },
            { amount: "15 oz can", name: "Black beans, rinsed" },
            { amount: "1 cup", name: "Vegetable broth" },
            { amount: "1 cup", name: "Corn kernels (frozen or fresh)" },
        ],
        instructions: [
            "Heat olive oil in a large pot or Dutch oven over medium heat. Add onion, bell pepper, and jalapeños. Cook until softened, about 5-7 minutes.",
            "Add garlic, chili powder, cumin, and smoked paprika. Cook for 1 minute more, stirring constantly.",
            "Stir in diced tomatoes, kidney beans, black beans, and vegetable broth.",
            "Bring to a simmer, then reduce heat to low, cover, and cook for at least 30 minutes to allow flavors to meld.",
            "Stir in corn and cook for another 5 minutes. Season with salt and pepper to taste.",
            "Serve hot with your favorite toppings like avocado, cilantro, or vegan sour cream.",
        ],
        comments: [
            { user: "QuickEats", text: "This was a great weeknight meal! I used a can of Ro-Tel tomatoes instead of plain diced tomatoes for extra flavor.", type: "suggestion", change: { type: "Substitution", from: "Diced tomatoes", to: "Ro-Tel tomatoes" }, timestamp: "4 days ago" },
            { user: "HealthyHacker", text: "To boost the protein, I added a cup of cooked quinoa at the end. It also gives it a great texture.", type: "suggestion", change: { type: "Addition", ingredient: "Cooked quinoa", amount: "1 cup" }, timestamp: "1 week ago" },
            { user: "SpiceKing", text: "Added chipotle peppers in adobo for smokiness - game changer!", type: "suggestion", change: { type: "Addition", ingredient: "Chipotle peppers in adobo", amount: "1-2 peppers" }, timestamp: "2 days ago" }
        ],
        likes: 218,
        saves: 95
    },
    {
        id: 3,
        title: "Traditional Challah Bread",
        author: { name: "Sarah Goldstein", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah Goldstein&backgroundColor=FFE5B4" },
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop",
        description: "A beautiful braided challah bread, perfect for Shabbat dinner or any special occasion. Slightly sweet and wonderfully soft.",
        prepTime: "30 min",
        cookTime: "35 min",
        servings: 12,
        difficulty: "Intermediate",
        tags: ["Kosher", "Bread", "Jewish", "Holiday", "Vegetarian"],
        ingredients: [
            { amount: "4 1/2 cups", name: "All-purpose flour" },
            { amount: "1/3 cup", name: "Sugar" },
            { amount: "2 1/4 tsp", name: "Active dry yeast" },
            { amount: "1 tsp", name: "Salt" },
            { amount: "3/4 cup", name: "Warm water" },
            { amount: "1/3 cup", name: "Vegetable oil" },
            { amount: "3", name: "Large eggs" },
            { amount: "1", name: "Egg yolk for brushing" },
            { amount: "2 tbsp", name: "Sesame or poppy seeds (optional)" },
        ],
        instructions: [
            "In a large bowl, combine flour, sugar, yeast, and salt.",
            "In another bowl, whisk together water, oil, and eggs.",
            "Pour wet ingredients into dry and mix until a dough forms.",
            "Knead for 8-10 minutes until smooth and elastic.",
            "Place in oiled bowl, cover, and let rise 1.5 hours until doubled.",
            "Punch down dough and divide into strands for braiding.",
            "Braid the dough, place on baking sheet, and let rise 30 minutes.",
            "Brush with egg yolk and sprinkle with seeds if using.",
            "Bake at 350°F for 30-35 minutes until golden brown.",
        ],
        comments: [
            { user: "BakerBeth", text: "I let it rise overnight in the fridge for better flavor - highly recommend!", type: "tip", timestamp: "3 days ago" },
            { user: "SweetTooth", text: "Added a tablespoon of honey for extra sweetness, perfect for Rosh Hashanah!", type: "suggestion", change: { type: "Addition", ingredient: "Honey", amount: "1 tbsp" }, timestamp: "1 week ago" }
        ],
        likes: 156,
        saves: 89
    },
    {
        id: 4,
        title: "Quick Weeknight Stir-Fry",
        author: { name: "James Wong", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=James Wong&backgroundColor=C8E6C9" },
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop",
        description: "A versatile stir-fry that comes together in under 30 minutes. Use whatever vegetables you have on hand!",
        prepTime: "15 min",
        cookTime: "12 min",
        servings: 4,
        difficulty: "Easy",
        tags: ["Asian", "Weeknight", "Quick", "Vegetarian-Adaptable"],
        ingredients: [
            { amount: "1 lb", name: "Chicken breast, sliced thin" },
            { amount: "3 tbsp", name: "Soy sauce" },
            { amount: "2 tbsp", name: "Sesame oil" },
            { amount: "2 cups", name: "Mixed vegetables (broccoli, bell peppers, snap peas)" },
            { amount: "3 cloves", name: "Garlic, minced" },
            { amount: "1 tbsp", name: "Fresh ginger, grated" },
            { amount: "2 tbsp", name: "Cornstarch" },
            { amount: "1/4 cup", name: "Water" },
        ],
        instructions: [
            "Mix cornstarch with water to create a slurry, set aside.",
            "Heat sesame oil in a wok or large skillet over high heat.",
            "Add chicken and cook until browned, about 5 minutes. Remove from pan.",
            "Add vegetables, garlic, and ginger. Stir-fry for 3-4 minutes.",
            "Return chicken to pan, add soy sauce and cornstarch slurry.",
            "Cook for 2-3 minutes until sauce thickens.",
            "Serve immediately over rice or noodles.",
        ],
        comments: [
            { user: "VeggieVince", text: "Swapped chicken for tofu - worked perfectly! Just pressed the tofu first.", type: "suggestion", change: { type: "Substitution", from: "Chicken breast", to: "Firm tofu" }, timestamp: "2 days ago" },
            { user: "UmamiQueen", text: "Add a splash of oyster sauce for extra depth of flavor!", type: "suggestion", change: { type: "Addition", ingredient: "Oyster sauce", amount: "1 tbsp" }, timestamp: "5 days ago" }
        ],
        likes: 287,
        saves: 142
    }
];

// --- Icon Components ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const HeartIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const BookmarkIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const ChefHatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>;

// --- Header Component ---
function Header({ onSearch, searchQuery }) {
    return (
        <header className="bg-gradient-to-r from-amber-600 to-orange-500 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <ChefHatIcon />
                        <h1 className="text-3xl font-bold text-white">KollabKitchen</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition backdrop-blur-sm">
                            <UploadIcon />
                            <span className="hidden md:inline">Upload Recipe</span>
                        </button>
                        <button className="flex items-center space-x-2 text-white hover:opacity-80 transition">
                            <img src="https://api.dicebear.com/7.x/initials/svg?seed=Me&backgroundColor=FFC107" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        placeholder="Search recipes, ingredients, occasions..."
                        className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white shadow-md text-gray-800 placeholder-gray-500"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <SearchIcon />
                    </div>
                </div>
            </div>
        </header>
    );
}

// --- Enhanced Recipe Card ---
function RecipeCard({ recipe, onSelectRecipe }) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    return (
        <div 
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => onSelectRecipe(recipe)}
        >
            <div className="relative h-56">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3 flex space-x-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                        className={`p-2 rounded-full backdrop-blur-md ${liked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700'} hover:scale-110 transition`}
                    >
                        <HeartIcon filled={liked} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
                        className={`p-2 rounded-full backdrop-blur-md ${saved ? 'bg-amber-500 text-white' : 'bg-white/80 text-gray-700'} hover:scale-110 transition`}
                    >
                        <BookmarkIcon filled={saved} />
                    </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white text-xl font-bold mb-1 line-clamp-2">{recipe.title}</h3>
                    <div className="flex items-center">
                        <img src={recipe.author.avatar} alt={recipe.author.name} className="w-6 h-6 rounded-full border-2 border-white" />
                        <p className="text-white/90 text-sm ml-2 font-medium">{recipe.author.name}</p>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                        <ClockIcon />
                        <span>{recipe.prepTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <UsersIcon />
                        <span>{recipe.servings} servings</span>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{recipe.difficulty}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{tag}</span>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                        <HeartIcon filled={false} />
                        <span>{recipe.likes}</span>
                    </span>
                    <span>{recipe.comments.length} community notes</span>
                </div>
            </div>
        </div>
    );
}

// --- Recipe Scaler Component ---
function RecipeScaler({ originalServings, currentServings, onServingsChange }) {
    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ScaleIcon />
                    <span className="font-semibold text-gray-700">Scale Recipe</span>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => onServingsChange(Math.max(1, currentServings - 1))}
                        className="w-8 h-8 rounded-full bg-white border-2 border-amber-400 text-amber-600 font-bold hover:bg-amber-50 transition"
                    >
                        -
                    </button>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-700">{currentServings}</div>
                        <div className="text-xs text-gray-500">servings</div>
                    </div>
                    <button 
                        onClick={() => onServingsChange(currentServings + 1)}
                        className="w-8 h-8 rounded-full bg-white border-2 border-amber-400 text-amber-600 font-bold hover:bg-amber-50 transition"
                    >
                        +
                    </button>
                </div>
            </div>
            {currentServings !== originalServings && (
                <p className="text-sm text-gray-600 mt-2">
                    Scaled from {originalServings} to {currentServings} servings (×{(currentServings / originalServings).toFixed(2)})
                </p>
            )}
        </div>
    );
}

// --- Enhanced Recipe Detail ---
function RecipeDetail({ recipe, onBack }) {
    const [currentServings, setCurrentServings] = useState(recipe.servings);
    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState('tip');
    
    const scaleFactor = currentServings / recipe.servings;
    
    const scaledIngredients = useMemo(() => {
        return recipe.ingredients.map(ing => {
            const numMatch = ing.amount.match(/[\d.\/]+/);
            if (numMatch) {
                const num = eval(numMatch[0]) * scaleFactor;
                const scaledAmount = ing.amount.replace(/[\d.\/]+/, num % 1 === 0 ? num : num.toFixed(2));
                return { ...ing, amount: scaledAmount };
            }
            return ing;
        });
    }, [recipe.ingredients, scaleFactor]);

    const aggregatedSuggestions = useMemo(() => {
        const suggestions = recipe.comments.filter(c => c.type === 'suggestion' && c.change);
        const aggregation = {};

        suggestions.forEach(s => {
            let key;
            if(s.change.type === 'Substitution') {
                key = `${s.change.from} → ${s.change.to}`;
            } else if (s.change.type === 'Addition') {
                key = `Add ${s.change.ingredient}`;
            }

            if (key) {
                if (!aggregation[key]) {
                    aggregation[key] = { count: 0, users: [], change: s.change };
                }
                aggregation[key].count++;
                aggregation[key].users.push(s.user);
            }
        });

        return Object.entries(aggregation)
            .sort(([, a], [, b]) => b.count - a.count)
            .map(([key, value]) => ({ suggestion: key, ...value }));
    }, [recipe.comments]);

    const getCommentIcon = (type) => {
        switch(type) {
            case 'suggestion': return '💡';
            case 'question': return '❓';
            case 'tip': return '⭐';
            default: return '💬';
        }
    };

    const getCommentColor = (type) => {
        switch(type) {
            case 'suggestion': return 'border-blue-400 bg-blue-50';
            case 'question': return 'border-yellow-400 bg-yellow-50';
            case 'tip': return 'border-green-400 bg-green-50';
            default: return 'border-gray-200 bg-white';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <button onClick={onBack} className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 font-semibold mb-6 group">
                    <BackIcon />
                    <span className="group-hover:underline">Back to Recipes</span>
                </button>
                
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="relative h-96">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8">
                            <h2 className="text-5xl font-bold text-white mb-4">{recipe.title}</h2>
                            <div className="flex items-center space-x-4 text-white">
                                <img src={recipe.author.avatar} alt={recipe.author.name} className="w-12 h-12 rounded-full border-3 border-white" />
                                <div>
                                    <p className="text-sm opacity-90">Created by</p>
                                    <p className="font-semibold text-lg">{recipe.author.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="text-center p-4 bg-amber-50 rounded-lg">
                                <ClockIcon />
                                <div className="mt-2 text-sm text-gray-600">Prep Time</div>
                                <div className="font-bold text-lg text-gray-800">{recipe.prepTime}</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <ClockIcon />
                                <div className="mt-2 text-sm text-gray-600">Cook Time</div>
                                <div className="font-bold text-lg text-gray-800">{recipe.cookTime}</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <UsersIcon />
                                <div className="mt-2 text-sm text-gray-600">Servings</div>
                                <div className="font-bold text-lg text-gray-800">{recipe.servings}</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <ChefHatIcon />
                                <div className="mt-2 text-sm text-gray-600">Difficulty</div>
                                <div className="font-bold text-lg text-gray-800">{recipe.difficulty}</div>
                            </div>
                        </div>

                        <p className="text-lg text-gray-700 leading-relaxed mb-6">{recipe.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                            {recipe.tags.map(tag => (
                                <span key={tag} className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full border border-amber-200">{tag}</span>
                            ))}
                        </div>

                        {/* Recipe Scaler */}
                        <RecipeScaler 
                            originalServings={recipe.servings}
                            currentServings={currentServings}
                            onServingsChange={setCurrentServings}
                        />

                        {/* Ingredients & Instructions */}
                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                                    <span className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></span>
                                    Ingredients
                                </h3>
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                                    <ul className="space-y-3">
                                        {scaledIngredients.map((ing, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                <div>
                                                    <span className="text-amber-700 font-bold">{ing.amount}</span>
                                                    <span className="text-gray-700 ml-2">{ing.name}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-2">
                                <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                                    <span className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></span>
                                    Instructions
                                </h3>
                                <div className="space-y-4">
                                    {recipe.instructions.map((step, index) => (
                                        <div key={index} className="flex">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                                                {index + 1}
                                            </div>
                                            <p className="text-gray-700 leading-relaxed pt-2">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Community Section - THE KICKER */}
                        <div className="mt-12 border-t-4 border-amber-200 pt-8">
                            <h3 className="text-3xl font-bold mb-2 text-gray-800 flex items-center">
                                <span className="text-4xl mr-3">👥</span>
                                Community Kitchen
                            </h3>
                            <p className="text-gray-600 mb-6">See how others have adapted this recipe</p>
                            
                            {/* Aggregated Suggestions - STAR FEATURE */}
                            {aggregatedSuggestions.length > 0 && (
                                <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl border-2 border-purple-200 shadow-lg">
                                    <h4 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                                        <span className="text-3xl mr-2">🔥</span>
                                        Popular Modifications
                                    </h4>
                                    <p className="text-sm text-purple-700 mb-4">Community-tested variations that you can apply with one click</p>
                                    <div className="space-y-3">
                                        {aggregatedSuggestions.map((agg, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition border border-purple-100">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full h-8 w-8 text-sm flex items-center justify-center font-bold mr-3">
                                                                {agg.count}
                                                            </span>
                                                            <span className="font-semibold text-gray-800">{agg.suggestion}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 ml-11">
                                                            ✓ Tried by {agg.users.join(', ')}
                                                        </p>
                                                        {agg.change.amount && (
                                                            <p className="text-sm text-purple-700 mt-1 ml-11">
                                                                Recommended amount: <span className="font-semibold">{agg.change.amount}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition text-sm font-semibold whitespace-nowrap">
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Comment Form */}
                            <div className="mb-8 bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                                <h4 className="font-semibold text-lg mb-4 text-gray-800">Share Your Experience</h4>
                                <div className="flex gap-2 mb-3">
                                    <button 
                                        onClick={() => setCommentType('tip')}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'tip' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                                    >
                                        ⭐ Tip
                                    </button>
                                    <button 
                                        onClick={() => setCommentType('suggestion')}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'suggestion' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                                    >
                                        💡 Suggestion
                                    </button>
                                    <button 
                                        onClick={() => setCommentType('question')}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'question' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                                    >
                                        ❓ Question
                                    </button>
                                </div>
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    rows="4"
                                    placeholder="Share a substitution, scaling tip, or ask a question..."
                                />
                                <div className="flex justify-end mt-3">
                                    <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-600 transition shadow-md">
                                        Post Community Note
                                    </button>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4">
                                <h4 className="text-xl font-semibold text-gray-800 mb-4">All Community Notes ({recipe.comments.length})</h4>
                                {recipe.comments.map((comment, index) => (
                                    <div key={index} className={`p-5 rounded-xl border-l-4 ${getCommentColor(comment.type)} shadow-sm hover:shadow-md transition`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center">
                                                <img 
                                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user}&backgroundColor=random`} 
                                                    alt={comment.user} 
                                                    className="w-10 h-10 rounded-full mr-3"
                                                />
                                                <div>
                                                    <span className="font-bold text-gray-800">{comment.user}</span>
                                                    <span className="text-xs text-gray-500 ml-2">{comment.timestamp}</span>
                                                </div>
                                            </div>
                                            <span className="text-2xl">{getCommentIcon(comment.type)}</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                                        {comment.change && (
                                            <div className="mt-3 p-3 bg-white/60 rounded-lg border border-gray-200">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                                    {comment.change.type}:
                                                </span>
                                                {comment.change.type === 'Substitution' && (
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        <span className="line-through">{comment.change.from}</span> → <span className="font-semibold text-green-700">{comment.change.to}</span>
                                                    </p>
                                                )}
                                                {comment.change.type === 'Addition' && (
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        Add <span className="font-semibold text-green-700">{comment.change.ingredient}</span>
                                                        {comment.change.amount && <span> ({comment.change.amount})</span>}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Filter Component ---
function FilterBar({ selectedFilters, onFilterChange }) {
    const filterOptions = [
        { id: 'all', label: 'All Recipes', color: 'amber' },
        { id: 'vegan', label: 'Vegan', color: 'green' },
        { id: 'kosher', label: 'Kosher', color: 'blue' },
        { id: 'weeknight', label: 'Weeknight', color: 'purple' },
        { id: 'holiday', label: 'Holiday', color: 'red' },
        { id: 'quick', label: 'Quick (<30min)', color: 'orange' },
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Discover Recipes</h2>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition">
                    <FilterIcon />
                    <span>More Filters</span>
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {filterOptions.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-5 py-2 rounded-full font-semibold transition-all ${
                            selectedFilters.includes(filter.id)
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
                                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-amber-400'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// --- Main App ---
export default function App() {
    const [view, setView] = useState('home');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState(['all']);

    const handleSelectRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setView('recipeDetail');
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setSelectedRecipe(null);
        setView('home');
    };

    const handleFilterChange = (filterId) => {
        if (filterId === 'all') {
            setSelectedFilters(['all']);
        } else {
            const newFilters = selectedFilters.filter(f => f !== 'all');
            if (selectedFilters.includes(filterId)) {
                const updated = newFilters.filter(f => f !== filterId);
                setSelectedFilters(updated.length === 0 ? ['all'] : updated);
            } else {
                setSelectedFilters([...newFilters, filterId]);
            }
        }
    };
    
    const filteredRecipes = mockRecipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (!matchesSearch) return false;
        
        if (selectedFilters.includes('all')) return true;
        
        return selectedFilters.some(filter => 
            recipe.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        );
    });

    return (
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 min-h-screen">
            <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
            <main>
                {view === 'home' && (
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <FilterBar 
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                        />
                        
                        {filteredRecipes.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-2xl text-gray-500">No recipes found matching your criteria</p>
                                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredRecipes.map(recipe => (
                                    <RecipeCard 
                                        key={recipe.id} 
                                        recipe={recipe} 
                                        onSelectRecipe={handleSelectRecipe}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {view === 'recipeDetail' && selectedRecipe && (
                    <RecipeDetail recipe={selectedRecipe} onBack={handleBack} />
                )}
            </main>
        </div>
    );
}