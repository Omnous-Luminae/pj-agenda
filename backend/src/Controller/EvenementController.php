<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Repository\EvenementRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/events')]
class EvenementController extends AbstractController
{
    #[Route('', name: 'api_events_list', methods: ['GET'])]
    public function list(EvenementRepository $repository): JsonResponse
    {
        $events = $repository->findAll();
        $data = [];

        foreach ($events as $event) {
            $data[] = [
                'id' => $event->getId(),
                'title' => $event->getTitre(),
                'description' => $event->getDescription(),
                'start' => $event->getDateDebut()->format('Y-m-d\TH:i:s'),
                'end' => $event->getDateFin()->format('Y-m-d\TH:i:s'),
                'backgroundColor' => $event->getCouleur() ?? '#3788d8',
                'type' => $event->getType(),
                'recurrent' => $event->isEstRecurrent(),
                'typeRecurrence' => $event->getTypeRecurrence(),
                'dateFinRecurrence' => $event->getDateFinRecurrence() ? $event->getDateFinRecurrence()->format('Y-m-d') : null,
            ];
        }

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_events_show', methods: ['GET'])]
    public function show(int $id, EvenementRepository $repository): JsonResponse
    {
        $event = $repository->find($id);

        if (!$event) {
            return $this->json(['error' => 'Événement non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $event->getId(),
            'title' => $event->getTitre(),
            'description' => $event->getDescription(),
            'start' => $event->getDateDebut()->format('Y-m-d\TH:i:s'),
            'end' => $event->getDateFin()->format('Y-m-d\TH:i:s'),
            'backgroundColor' => $event->getCouleur(),
            'type' => $event->getType(),
            'recurrent' => $event->isEstRecurrent(),
            'typeRecurrence' => $event->getTypeRecurrence(),
        ]);
    }

    #[Route('', name: 'api_events_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $event = new Evenement();
        $event->setTitre($data['title'] ?? 'Sans titre');
        $event->setDescription($data['description'] ?? null);
        $event->setDateDebut(new \DateTime($data['start']));
        $event->setDateFin(new \DateTime($data['end']));
        $event->setCouleur($data['backgroundColor'] ?? '#3788d8');
        $event->setType($data['type'] ?? null);
        
        // Gérer la récurrence
        $isRecurrent = isset($data['recurrent']) && filter_var($data['recurrent'], FILTER_VALIDATE_BOOLEAN);
        $event->setEstRecurrent($isRecurrent);
        
        // Uniquement définir type_recurrence si l'événement est récurrent ET que la valeur n'est pas vide
        if ($isRecurrent && isset($data['typeRecurrence']) && !empty($data['typeRecurrence'])) {
            $event->setTypeRecurrence($data['typeRecurrence']);
        } else {
            $event->setTypeRecurrence(null);
        }
        
        if ($isRecurrent && isset($data['dateFinRecurrence']) && !empty($data['dateFinRecurrence'])) {
            $event->setDateFinRecurrence(new \DateTime($data['dateFinRecurrence']));
        } else {
            $event->setDateFinRecurrence(null);
        }

        $em->persist($event);
        $em->flush();

        return $this->json([
            'id' => $event->getId(),
            'message' => 'Événement créé avec succès'
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_events_update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request, EvenementRepository $repository, EntityManagerInterface $em): JsonResponse
    {
        $event = $repository->find($id);

        if (!$event) {
            return $this->json(['error' => 'Événement non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $event->setTitre($data['title']);
        if (isset($data['description'])) $event->setDescription($data['description']);
        if (isset($data['start'])) $event->setDateDebut(new \DateTime($data['start']));
        if (isset($data['end'])) $event->setDateFin(new \DateTime($data['end']));
        if (isset($data['backgroundColor'])) $event->setCouleur($data['backgroundColor']);
        if (isset($data['type'])) $event->setType($data['type']);
        
        // Gestion de la récurrence
        if (array_key_exists('recurrent', $data)) {
            $isRecurrent = filter_var($data['recurrent'], FILTER_VALIDATE_BOOLEAN);
            $event->setEstRecurrent($isRecurrent);
            
            // Si l'événement n'est plus récurrent, on force les champs de récurrence à null
            if (!$isRecurrent) {
                $event->setTypeRecurrence(null);
                $event->setDateFinRecurrence(null);
            } else {
                // L'événement est récurrent, on met à jour les champs uniquement si valeur non vide
                if (array_key_exists('typeRecurrence', $data) && !empty($data['typeRecurrence'])) {
                    $event->setTypeRecurrence($data['typeRecurrence']);
                }
                
                if (array_key_exists('dateFinRecurrence', $data) && !empty($data['dateFinRecurrence'])) {
                    $event->setDateFinRecurrence(new \DateTime($data['dateFinRecurrence']));
                } elseif (array_key_exists('dateFinRecurrence', $data)) {
                    $event->setDateFinRecurrence(null);
                }
            }
        } else {
            // Si recurrent n'est pas dans les données, on met à jour uniquement les autres champs si présents
            if (array_key_exists('typeRecurrence', $data)) {
                $event->setTypeRecurrence($data['typeRecurrence'] ?: null);
            }
            
            if (array_key_exists('dateFinRecurrence', $data) && !empty($data['dateFinRecurrence'])) {
                $event->setDateFinRecurrence(new \DateTime($data['dateFinRecurrence']));
            }
        }
        
        $event->setUpdatedAt(new \DateTime());

        $em->flush();

        return $this->json([
            'id' => $event->getId(),
            'message' => 'Événement mis à jour avec succès'
        ]);
    }

    #[Route('/{id}', name: 'api_events_delete', methods: ['DELETE'])]
    public function delete(int $id, EvenementRepository $repository, EntityManagerInterface $em): JsonResponse
    {
        $event = $repository->find($id);

        if (!$event) {
            return $this->json(['error' => 'Événement non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($event);
        $em->flush();

        return $this->json([
            'message' => 'Événement supprimé avec succès'
        ]);
    }
}
