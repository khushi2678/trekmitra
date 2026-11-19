
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TrekMitra Homepage - Temporary Visual Preview
|--------------------------------------------------------------------------
| Sample data is used only to preview the homepage.
| No database records are created or modified.
*/

Route::inertia('/', 'home', [

    'hero' => [
        'photo_url' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=85',
        'trek_name' => 'Valley of Flowers',
        'state' => 'Uttarakhand',
        'slug' => 'valley-of-flowers',
        'max_altitude_m' => 3658,
        'video_url' => null,
    ],

    'featured' => [

        [
            'id' => 1,
            'slug' => 'kedarkantha',
            'name' => 'Kedarkantha',
            'state' => 'Uttarakhand',
            'nearest_city' => 'Dehradun',
            'level' => 'beginner',
            'duration_days' => 5,
            'max_altitude_m' => 3810,
            'short_description' => 'A beautiful winter trek through forests and snow-covered trails.',
            'cover_url' => 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=900&q=85',
            'from_price' => 599900,
        ],

        [
            'id' => 2,
            'slug' => 'hampta-pass',
            'name' => 'Hampta Pass',
            'state' => 'Himachal Pradesh',
            'nearest_city' => 'Manali',
            'level' => 'intermediate',
            'duration_days' => 5,
            'max_altitude_m' => 4270,
            'short_description' => 'A dramatic transition from green valleys to mountain deserts.',
            'cover_url' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85',
            'from_price' => 899900,
        ],

        [
            'id' => 3,
            'slug' => 'brahmatal',
            'name' => 'Brahmatal',
            'state' => 'Uttarakhand',
            'nearest_city' => 'Rishikesh',
            'level' => 'beginner',
            'duration_days' => 6,
            'max_altitude_m' => 3840,
            'short_description' => 'A scenic Himalayan trail with beautiful mountain views.',
            'cover_url' => 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=900&q=85',
            'from_price' => 749900,
        ],

        [
            'id' => 4,
            'slug' => 'rupin-pass',
            'name' => 'Rupin Pass',
            'state' => 'Himachal Pradesh',
            'nearest_city' => 'Shimla',
            'level' => 'expert',
            'duration_days' => 7,
            'max_altitude_m' => 4650,
            'short_description' => 'A challenging route through remote Himalayan landscapes.',
            'cover_url' => 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=85',
            'from_price' => 1299900,
        ],

        [
            'id' => 5,
            'slug' => 'valley-of-flowers',
            'name' => 'Valley of Flowers',
            'state' => 'Uttarakhand',
            'nearest_city' => 'Dehradun',
            'level' => 'beginner',
            'duration_days' => 4,
            'max_altitude_m' => 3658,
            'short_description' => 'Explore a spectacular Himalayan valley filled with alpine flowers.',
            'cover_url' => 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=85',
            'from_price' => 699900,
        ],

        [
            'id' => 6,
            'slug' => 'chadar-trek',
            'name' => 'Chadar Trek',
            'state' => 'Ladakh',
            'nearest_city' => 'Leh',
            'level' => 'expert',
            'duration_days' => 8,
            'max_altitude_m' => 3390,
            'short_description' => 'An extraordinary winter journey across a frozen river.',
            'cover_url' => 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=85',
            'from_price' => 1899900,
        ],
    ],

    'recommended' => null,

    'levels' => [
        [
            'value' => 'beginner',
            'trek_count' => 2,
            'min_days' => 4,
            'max_days' => 5,
            'min_altitude_m' => 3658,
            'max_altitude_m' => 3810,
        ],
        [
            'value' => 'intermediate',
            'trek_count' => 1,
            'min_days' => 5,
            'max_days' => 5,
            'min_altitude_m' => 4270,
            'max_altitude_m' => 4270,
        ],
        [
            'value' => 'expert',
            'trek_count' => 2,
            'min_days' => 7,
            'max_days' => 8,
            'min_altitude_m' => 3390,
            'max_altitude_m' => 4650,
        ],
    ],

    'cities' => [
        'Dehradun',
        'Manali',
        'Rishikesh',
        'Shimla',
        'Leh',
    ],

])->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
