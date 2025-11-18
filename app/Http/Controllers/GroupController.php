<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        $groups = Group::all();

        return Inertia::render('Groups/index', [
            'groups' => $groups,


        ]);
    }
}
