<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Contracts;

use App\Modules\Catalog\Application\DTOs\CreateDressDTO;
use App\Modules\Catalog\Application\DTOs\UpdateDressDTO;
use App\Modules\Catalog\Domain\Entities\Dress;

/**
 * Public write contract for the Catalog module. Atelier and admin controllers
 * mutate dresses only through this contract; the frontend never writes
 * catalog tables directly.
 */
interface DressManagementContract
{
    public function createDress(int $atelierId, CreateDressDTO $dto): Dress;

    public function updateDress(int $dressId, UpdateDressDTO $dto): Dress;

    public function publishDress(int $dressId): void;

    public function archiveDress(int $dressId): void;

    public function deleteDress(int $dressId): void;

    /**
     * @param  list<array{size_code: string, bust?: float|string|null, waist?: float|string|null, hips?: float|string|null, length?: float|string|null, is_available?: bool}>  $sizes
     */
    public function syncSizeMatrix(int $dressId, array $sizes): void;

    /**
     * @param  list<int>  $imageOrderIds
     */
    public function reorderImages(int $dressId, array $imageOrderIds): void;
}
