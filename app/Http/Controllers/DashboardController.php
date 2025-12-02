<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Swimmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $groupController = new GroupController();
        $groupsWithCalendar = $groupController->getGroupsWithCalendar();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalGroups' => Group::count(),
                'totalSwimmers' => Swimmer::count(),
                'activeClasses' => Group::whereDate('created_at', today())->count(),
                'upcomingClasses' => Group::where('created_at', '>=', now())->count(),
            ],
            'groups' => $groupsWithCalendar,
        ]);
    }
}
