<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ApiController extends AbstractController
{
    #[Route('/', name: 'api_home')]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Bienvenue sur l\'API PJ Agenda',
            'status' => 'OK',
            'version' => '1.0.0'
        ]);
    }

    #[Route('/api/health', name: 'api_health')]
    public function health(): JsonResponse
    {
        return $this->json([
            'status' => 'healthy',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s')
        ]);
    }
}
