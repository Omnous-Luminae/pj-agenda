<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_user')]
    private ?int $id = null;

    #[ORM\Column(name: 'nom_user', length: 50)]
    private ?string $nomUser = null;

    #[ORM\Column(name: 'prenom_user', length: 50)]
    private ?string $prenomUser = null;

    #[ORM\Column(length: 100, unique: true)]
    private ?string $email = null;

    #[ORM\Column(name: 'mdp_user', length: 255)]
    private ?string $mdpUser = null;

    #[ORM\Column(name: 'date_changement_mdp_user', type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $dateChangementMdpUser = null;

    #[ORM\Column(name: 'status_user', length: 10)]
    private ?string $statusUser = 'active';

    #[ORM\Column(name: 'user_created_at', type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $userCreatedAt = null;

    #[ORM\Column(name: 'user_updated_at', type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $userUpdatedAt = null;

    public function __construct()
    {
        $this->userCreatedAt = new \DateTime();
        $this->userUpdatedAt = new \DateTime();
        $this->dateChangementMdpUser = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomUser(): ?string
    {
        return $this->nomUser;
    }

    public function setNomUser(string $nomUser): static
    {
        $this->nomUser = $nomUser;
        return $this;
    }

    public function getPrenomUser(): ?string
    {
        return $this->prenomUser;
    }

    public function setPrenomUser(string $prenomUser): static
    {
        $this->prenomUser = $prenomUser;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getMdpUser(): ?string
    {
        return $this->mdpUser;
    }

    public function setMdpUser(string $mdpUser): static
    {
        $this->mdpUser = $mdpUser;
        return $this;
    }

    public function getDateChangementMdpUser(): ?\DateTimeInterface
    {
        return $this->dateChangementMdpUser;
    }

    public function setDateChangementMdpUser(\DateTimeInterface $dateChangementMdpUser): static
    {
        $this->dateChangementMdpUser = $dateChangementMdpUser;
        return $this;
    }

    public function getStatusUser(): ?string
    {
        return $this->statusUser;
    }

    public function setStatusUser(string $statusUser): static
    {
        $this->statusUser = $statusUser;
        return $this;
    }

    public function getUserCreatedAt(): ?\DateTimeInterface
    {
        return $this->userCreatedAt;
    }

    public function setUserCreatedAt(\DateTimeInterface $userCreatedAt): static
    {
        $this->userCreatedAt = $userCreatedAt;
        return $this;
    }

    public function getUserUpdatedAt(): ?\DateTimeInterface
    {
        return $this->userUpdatedAt;
    }

    public function setUserUpdatedAt(\DateTimeInterface $userUpdatedAt): static
    {
        $this->userUpdatedAt = $userUpdatedAt;
        return $this;
    }
}
