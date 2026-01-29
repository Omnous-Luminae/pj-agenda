<?php

namespace App\Entity;

use App\Repository\EvenementRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EvenementRepository::class)]
#[ORM\Table(name: 'evenements')]
class Evenement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_event')]
    private ?int $id = null;

    #[ORM\Column(name: 'titre_event', length: 200)]
    private ?string $titre = null;

    #[ORM\Column(name: 'description_event', type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(name: 'date_debut_event', type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $dateDebut = null;

    #[ORM\Column(name: 'date_fin_event', type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $dateFin = null;

    #[ORM\Column(name: 'type_event', length: 100, nullable: true)]
    private ?string $type = null;

    #[ORM\Column(name: 'couleur_event', length: 7, nullable: true)]
    private ?string $couleur = null;

    #[ORM\Column(name: 'est_recurrent', type: Types::BOOLEAN, options: ['default' => false])]
    private ?bool $estRecurrent = false;

    #[ORM\Column(name: 'type_recurrence', length: 20, nullable: true)]
    private ?string $typeRecurrence = null;

    #[ORM\Column(name: 'date_fin_recurrence', type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateFinRecurrence = null;

    #[ORM\Column(name: 'id_cal', nullable: true)]
    private ?int $idCal = null;

    #[ORM\Column(name: 'event_created_at', type: Types::DATETIME_MUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(name: 'event_updated_at', type: Types::DATETIME_MUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->estRecurrent = false;
    }

    // Getters et Setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): self
    {
        $this->titre = $titre;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getDateDebut(): ?\DateTimeInterface
    {
        return $this->dateDebut;
    }

    public function setDateDebut(\DateTimeInterface $dateDebut): self
    {
        $this->dateDebut = $dateDebut;
        return $this;
    }

    public function getDateFin(): ?\DateTimeInterface
    {
        return $this->dateFin;
    }

    public function setDateFin(\DateTimeInterface $dateFin): self
    {
        $this->dateFin = $dateFin;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(?string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getCouleur(): ?string
    {
        return $this->couleur;
    }

    public function setCouleur(?string $couleur): self
    {
        $this->couleur = $couleur;
        return $this;
    }

    public function isEstRecurrent(): ?bool
    {
        return $this->estRecurrent;
    }

    public function setEstRecurrent(bool $estRecurrent): self
    {
        $this->estRecurrent = $estRecurrent;
        return $this;
    }

    public function getTypeRecurrence(): ?string
    {
        return $this->typeRecurrence;
    }

    public function setTypeRecurrence(?string $typeRecurrence): self
    {
        $this->typeRecurrence = $typeRecurrence;
        return $this;
    }

    public function getDateFinRecurrence(): ?\DateTimeInterface
    {
        return $this->dateFinRecurrence;
    }

    public function setDateFinRecurrence(?\DateTimeInterface $dateFinRecurrence): self
    {
        $this->dateFinRecurrence = $dateFinRecurrence;
        return $this;
    }

    public function getIdCal(): ?int
    {
        return $this->idCal;
    }

    public function setIdCal(?int $idCal): self
    {
        $this->idCal = $idCal;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
