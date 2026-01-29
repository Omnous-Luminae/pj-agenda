<?php

namespace App\Repository;

use App\Entity\Calendrier;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CalendrierRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Calendrier::class);
    }

    /**
     * Récupère tous les calendriers accessibles par un utilisateur
     * (ses propres calendriers + les calendriers communs)
     */
    public function findByUser(int $userId): array
    {
        $conn = $this->getEntityManager()->getConnection();
        
        $sql = '
            SELECT c.id_cal, c.nom_cal, c.est_commun, uc.role_user,
                   (SELECT COUNT(*) FROM evenements WHERE id_cal = c.id_cal) as event_count,
                   (SELECT COUNT(*) FROM user_calendriers WHERE id_cal = c.id_cal AND id_user != ?) as shared_count
            FROM calendriers c
            LEFT JOIN user_calendriers uc ON c.id_cal = uc.id_cal AND uc.id_user = ?
            WHERE c.est_commun = 1 OR uc.id_user = ?
            ORDER BY c.est_commun DESC, c.cal_created_at DESC
        ';
        
        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([$userId, $userId, $userId]);
        
        return $result->fetchAllAssociative();
    }
}
