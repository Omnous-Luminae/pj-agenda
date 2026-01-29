<?php

namespace App\Controller;

use App\Entity\Calendrier;
use App\Repository\CalendrierRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/calendars')]
class CalendrierController extends AbstractController
{
    #[Route('/{userId}', name: 'api_calendars_list', methods: ['GET'])]
    public function list(int $userId, CalendrierRepository $repository): JsonResponse
    {
        $calendars = $repository->findByUser($userId);
        
        $data = [];
        foreach ($calendars as $calendar) {
            $data[] = [
                'id' => $calendar['id_cal'],
                'nom' => $calendar['nom_cal'],
                'role' => $calendar['role_user'] ?? 'lecteur',
                'isCommon' => (bool) $calendar['est_commun'],
                'eventCount' => (int) $calendar['event_count'],
                'sharedWith' => (int) $calendar['shared_count']
            ];
        }

        return $this->json($data);
    }

    #[Route('', name: 'api_calendars_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['nom']) || !isset($data['userId'])) {
            return $this->json(['error' => 'Nom et userId requis'], Response::HTTP_BAD_REQUEST);
        }

        // Créer le calendrier
        $calendrier = new Calendrier();
        $calendrier->setNom($data['nom']);
        $calendrier->setEstCommun($data['estCommun'] ?? false);

        $em->persist($calendrier);
        $em->flush();

        // Ajouter l'utilisateur comme propriétaire
        $conn = $em->getConnection();
        $sql = 'INSERT INTO user_calendriers (id_user, id_cal, role_user) VALUES (?, ?, ?)';
        $stmt = $conn->prepare($sql);
        $stmt->executeStatement([
            $data['userId'],
            $calendrier->getId(),
            'proprietaire'
        ]);

        return $this->json([
            'id' => $calendrier->getId(),
            'message' => 'Calendrier créé avec succès'
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_calendars_update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request, CalendrierRepository $repository, EntityManagerInterface $em): JsonResponse
    {
        $calendrier = $repository->find($id);

        if (!$calendrier) {
            return $this->json(['error' => 'Calendrier non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) {
            $calendrier->setNom($data['nom']);
        }

        if (isset($data['estCommun'])) {
            $calendrier->setEstCommun($data['estCommun']);
        }

        $calendrier->setUpdatedAt(new \DateTime());
        $em->flush();

        return $this->json([
            'id' => $calendrier->getId(),
            'message' => 'Calendrier mis à jour avec succès'
        ]);
    }

    #[Route('/{id}', name: 'api_calendars_delete', methods: ['DELETE'])]
    public function delete(int $id, CalendrierRepository $repository, EntityManagerInterface $em): JsonResponse
    {
        $calendrier = $repository->find($id);

        if (!$calendrier) {
            return $this->json(['error' => 'Calendrier non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que ce n'est pas un calendrier commun
        if ($calendrier->isEstCommun()) {
            return $this->json(['error' => 'Impossible de supprimer un calendrier commun'], Response::HTTP_FORBIDDEN);
        }

        $em->remove($calendrier);
        $em->flush();

        return $this->json([
            'message' => 'Calendrier supprimé avec succès'
        ]);
    }

    #[Route('/{calId}/share', name: 'api_calendars_share', methods: ['POST'])]
    public function share(int $calId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['userId']) || !isset($data['role'])) {
            return $this->json(['error' => 'userId et role requis'], Response::HTTP_BAD_REQUEST);
        }

        $conn = $em->getConnection();
        
        // Vérifier si l'utilisateur a déjà accès
        $checkSql = 'SELECT COUNT(*) as count FROM user_calendriers WHERE id_user = ? AND id_cal = ?';
        $stmt = $conn->prepare($checkSql);
        $result = $stmt->executeQuery([$data['userId'], $calId]);
        $exists = $result->fetchOne();

        if ($exists > 0) {
            // Mettre à jour le rôle
            $updateSql = 'UPDATE user_calendriers SET role_user = ? WHERE id_user = ? AND id_cal = ?';
            $stmt = $conn->prepare($updateSql);
            $stmt->executeStatement([
                $data['role'],
                $data['userId'],
                $calId
            ]);
            $message = 'Rôle mis à jour';
        } else {
            // Ajouter l'accès
            $insertSql = 'INSERT INTO user_calendriers (id_user, id_cal, role_user) VALUES (?, ?, ?)';
            $stmt = $conn->prepare($insertSql);
            $stmt->executeStatement([
                $data['userId'],
                $calId,
                $data['role']
            ]);
            $message = 'Calendrier partagé avec succès';
        }

        return $this->json(['message' => $message]);
    }

    #[Route('/{calId}/unshare/{userId}', name: 'api_calendars_unshare', methods: ['DELETE'])]
    public function unshare(int $calId, int $userId, EntityManagerInterface $em): JsonResponse
    {
        $conn = $em->getConnection();
        $sql = 'DELETE FROM user_calendriers WHERE id_user = ? AND id_cal = ? AND role_user != "proprietaire"';
        $stmt = $conn->prepare($sql);
        $stmt->executeStatement([$userId, $calId]);

        return $this->json(['message' => 'Partage retiré avec succès']);
    }
}
