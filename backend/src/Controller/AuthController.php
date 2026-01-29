<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->json([
                'message' => 'Email et mot de passe requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer l'utilisateur par email
        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $data['email']]);

        if (!$user) {
            return $this->json([
                'message' => 'Identifiants incorrects'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le statut
        if ($user->getStatusUser() !== 'active') {
            return $this->json([
                'message' => 'Compte désactivé'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier le mot de passe (en clair pour l'instant, à hasher plus tard)
        if ($user->getMdpUser() !== $data['password']) {
            return $this->json([
                'message' => 'Identifiants incorrects'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Connexion réussie
        return $this->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nom' => $user->getNomUser(),
                'prenom' => $user->getPrenomUser(),
                'status' => $user->getStatusUser()
            ]
        ]);
    }

    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        return $this->json([
            'message' => 'Déconnexion réussie'
        ]);
    }
}
