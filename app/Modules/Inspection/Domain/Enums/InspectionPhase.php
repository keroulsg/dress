<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Enums;

enum InspectionPhase: string
{
    case PreDispatch = 'pre_dispatch';
    case PostReturn = 'post_return';
}
