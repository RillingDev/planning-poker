package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;
import org.springframework.lang.Nullable;

import java.util.Comparator;
import java.util.StringJoiner;

@Entity
@Table(name = "room_member")
public class RoomMember extends BaseEntity {
    public static final Comparator<RoomMember> ALPHABETIC_COMPARATOR = Comparator.comparing(RoomMember::getUsername, String::compareToIgnoreCase);

    public enum Role {
        VOTER, OBSERVER
    }
    @Column(name = "username", nullable = false)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private Role role = Role.VOTER;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "vote", joinColumns = {
            @JoinColumn(name = "room_member_id", referencedColumnName = "id")}, inverseJoinColumns = {
            @JoinColumn(name = "card_id", referencedColumnName = "id")})
    @Nullable
    private Card vote;

    protected RoomMember() {
    }

    /**
     * @param username Must be derived from a valid {@link org.springframework.security.core.userdetails.UserDetails}.
     */
    public RoomMember(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }


    @Nullable
    public Card getVote() {
        return vote;
    }

    public void setVote(@Nullable Card vote) {
        this.vote = vote;
    }

    @Override
    public String toString() {
        return new StringJoiner(", ", RoomMember.class.getSimpleName() + "[", "]").add("username='" + username + "'")
                .add("role=" + role)
                .toString();
    }
}
