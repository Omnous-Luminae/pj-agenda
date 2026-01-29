<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'user_calendriers')]
class UserCalendrier
{
    #[ORM\Id]
    #[ORM\Column(name: 'id_user', type: 'integer')]
    private ?int $idUser = null;

    #[ORM\Id]
    #[ORM\Column(name: 'id_cal', type: 'integer')]
    private ?int $idCal = null;

    #[ORM\Column(name: 'role_user', type: 'string', length: 20)]
    private ?string $roleUser = 'lecteur';

    public function getIdUser(): ?int
    {
        return $this->idUser;
    }

    public function setIdUser(int $idUser): self
    {
        $this->idUser = $idUser;
        return $this;
    }

    public function getIdCal(): ?int
    {
        return $this->idCal;
    }

    public function setIdCal(int $idCal): self
    {
        $this->idCal = $idCal;
        return $this;
    }

    public function getRoleUser(): ?string
    {
        return $this->roleUser;
    }

    public function setRoleUser(string $roleUser): self
    {
        $this->roleUser = $roleUser;
        return $this;
    }
}
