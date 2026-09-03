<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('position');
            $table->string('resume_url')->nullable();
            $table->enum('stage', ['applied', 'interview', 'test', 'offer', 'accepted', 'rejected'])->default('applied');
            $table->unsignedTinyInteger('rating')->nullable()->comment('1-5 stars');
            $table->timestamps();

            $table->index('stage');
            $table->index('rating');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
