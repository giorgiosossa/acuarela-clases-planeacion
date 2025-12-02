<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
        });

        Schema::table('levels', function (Blueprint $table) {
            $table->text('objective')->nullable()->after('name');
            $table->text('description')->nullable()->after('objective');
        });

        Schema::table('skills', function (Blueprint $table) {
            $table->text('objective')->nullable()->after('name');
            $table->text('description')->nullable()->after('objective'); // Technical description
            $table->text('drills')->nullable()->after('description'); // Suggested exercises
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['description']);
        });

        Schema::table('levels', function (Blueprint $table) {
            $table->dropColumn(['objective', 'description']);
        });

        Schema::table('skills', function (Blueprint $table) {
            $table->dropColumn(['objective', 'description', 'drills']);
        });
    }
};