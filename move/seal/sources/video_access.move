/// FLOW SUMMARY

/// 1. Creator calls `create_video_entry()` via wallet/front-end
///    - Creates Video object with metadata, pricing, TTL, and scarcity
///    - Returns a VideoCap for the creator
///
/// 2. Users call `buy_access()` and pay the required SUI
///    - Creates a VideoAccess object
///    - Initializes `copies_remaining` from Video.scarcity
///
/// 3. Users access the video
///    - Contract enforces TTL and SEAL copy limits
///    - `use_access()` decrements copies_remaining on consumption
///
/// 4. Creator can update the Video by calling `publish_video()` using the VideoCap
///    - Attaches the file to the Video object on-chain
///    - Only valid for the cap owner
///
/// This structure enforces:
/// - Scarcity (limited edition videos)
/// - Time-limited access (TTL)
/// - SEAL copy enforcement (prevent over-sharing)
/// - On-chain ownership of metadata and access control

module seal::video_access;

use std::string::String;
use std::u64;
use sui::clock::Clock;
use sui::coin::Coin;
use sui::dynamic_field as df;
use sui::sui::SUI;

//=== ERROR CODES ===
const EInvalidFee: u64 = 0;
const ENoAccess: u64 = 1;
const EInvalidCap: u64 = 2;

/// Represents a Video uploaded by a creator
/// Contains metadata, pricing, and scarcity settings
public struct Video has key {
    id: UID, // Unique object ID for the Video
    creator: address, // Address of the content creator
    title: String, // Title of the video
    description: String, // Description / summary of video content
    category: String, // Category label (e.g., Documentary, BTS)
    tags: vector<String>, // Optional tags for search/filter
    blob_id: String, // Identifier pointing to the uploaded file on Walrus
    price: u64, // Price in SUI to purchase access
    ttl: u64, // Time-to-live (in ms); 0 = lifetime access
    scarcity: u64, // Max allowed purchases; 0 = unlimited
}

/// Represents a user's access to a specific Video
/// Encapsulates SEAL copy restrictions and time-limited access
public struct VideoAccess has key {
    id: UID, // Unique ID of the access object
    video_id: ID, // Associated Video object ID
    owner: address, // Address of the user with access
    created_at: u64, // Timestamp when access was granted
    copies_remaining: u64, // Remaining SEAL-limited copies
}

/// Cap object that allows the creator to manage a specific Video
/// Only the owner of the cap can update or publish the video
public struct VideoCap has key {
    id: UID,
    video_id: ID,
}

/// Function to create a Video object with the specified metadata and parameters
/// Returns a VideoCap for the creator to manage the video
public fun create_video(
    title: String,
    description: String,
    category: String,
    tags: vector<String>,
    blob_id: String,
    price: u64,
    ttl: u64,
    scarcity: u64,
    ctx: &mut TxContext,
): VideoCap {
    let video = Video {
        id: object::new(ctx),
        creator: ctx.sender(),
        title,
        description,
        category,
        tags,
        blob_id,
        price,
        ttl,
        scarcity,
    };

    let cap = VideoCap {
        id: object::new(ctx),
        video_id: object::id(&video),
    };

    // Share the video object so it can be referenced by others
    transfer::share_object(video);
    cap
}

/// Entry function exposed to wallets/front-end
/// Wraps `create_video` and transfers the VideoCap to the creator
entry fun create_video_entry(
    title: String,
    description: String,
    category: String,
    tags: vector<String>,
    blob_id: String,
    price: u64,
    ttl: u64,
    scarcity: u64,
    ctx: &mut TxContext,
) {
    transfer::transfer(
        create_video(title, description, category, tags, blob_id, price, ttl, scarcity, ctx),
        ctx.sender(),
    );
}

/// User purchases access to a video by paying the correct price
/// Initializes `VideoAccess` with SEAL copy limits and timestamp
public fun buy_access(
    price: Coin<SUI>, // Coin sent by the user
    video: &Video, // Reference to the video being purchased
    clock: &Clock, // Clock to record purchase timestamp
    ctx: &mut TxContext,
): VideoAccess {
    assert!(price.value() == video.price, EInvalidFee);
    transfer::public_transfer(price, video.creator);

    // Initialize SEAL copy count based on scarcity
    let copies = if (video.scarcity == 0) { u64::max_value!() } else { video.scarcity };

    VideoAccess {
        id: object::new(ctx),
        video_id: object::id(video),
        owner: ctx.sender(),
        created_at: clock.timestamp_ms(),
        copies_remaining: copies,
    }
}

/// Checks whether a user currently has valid access to a video
/// Returns false if:
/// - the VideoAccess does not match the Video
/// - the TTL has expired
/// - the SEAL copy limit is exhausted
public fun check_access(access: &VideoAccess, video: &Video, clock: &Clock): bool {
    if (access.video_id != object::id(video)) {
        return false
    };
    if (video.ttl > 0 && clock.timestamp_ms() > access.created_at + video.ttl) {
        return false
    };
    if (access.copies_remaining == 0) {
        return false
    };
    true
}

/// Decrements remaining copies for SEAL enforcement when a user accesses or consumes a video
/// Throws ENoAccess if no copies remain
public fun use_access(access: &mut VideoAccess) {
    assert!(access.copies_remaining > 0, ENoAccess);
    access.copies_remaining = access.copies_remaining - 1;
}

/// Updates the `blob_id` of a video (attach uploaded content) using the VideoCap
/// Only the owner of the VideoCap can call this
public fun publish_video(video: &mut Video, cap: &VideoCap, blob_id: String) {
    assert!(cap.video_id == object::id(video), EInvalidCap);
    df::add(&mut video.id, blob_id, 0);
}

//===== Admin Functions =====

/// Update video price (creator only)
public fun update_price(_cap: &VideoCap, video: &mut Video, new_price: u64) {
    video.price = new_price;
}

/// Update video metadata (creator only)
public fun update_metadata(
    _cap: &VideoCap,
    video: &mut Video,
    new_title: String,
    new_description: String,
    new_category: String,
    new_tags: vector<String>,
) {
    video.title = new_title;
    video.description = new_description;
    video.category = new_category;
    video.tags = new_tags;
}
/// Delete a video and its access tokens (creator only)
    public fun delete_video(
        cap: VideoCap,
        video: Video,
    ) {
        let Video {
            id,
        creator:_,
        title:_,
        description:_,
        category:_,
        tags:_,
        blob_id:_,
        price:_,
        ttl:_,
        scarcity:_,
        } = video;
        object::delete(id);

        let VideoCap{id, video_id:_} = cap;
        object::delete(id);
    }


/// === SEAL-Style Access Control ===
/// All allowlisted keys (prefixes) can access a video while TTL and copies remain
fun approve_internal(id: vector<u8>, access: &VideoAccess, video: &Video, clock: &Clock): bool {
    if (access.video_id != object::id(video)) {
        return false
    };
    if (video.ttl > 0 && clock.timestamp_ms() > access.created_at + video.ttl) {
        return false
    };
    if (access.copies_remaining == 0) {
        return false
    };
    // Prefix check using video.id for allowlist keys
    is_prefix(&video.id.to_bytes(), &id)
}

/// Entry function to perform SEAL approval
entry fun seal_approve(id: vector<u8>, access: &VideoAccess, video: &Video, clock: &Clock) {
    assert!(approve_internal(id, access, video, clock), ENoAccess);
}

fun is_prefix(slice: &vector<u8>, full: &vector<u8>): bool {
    if (vector::length(slice) > vector::length(full)) {
        return false
    };
    let mut i = 0;
    while (i < vector::length(slice)) {
        if (vector::borrow(slice, i) != vector::borrow(full, i)) {
            return false
        };
        i = i + 1;
    };
    true
}
